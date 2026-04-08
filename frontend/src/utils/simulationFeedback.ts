import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  type Firestore,
} from "firebase/firestore";
import type { LessonEvaluationType } from "../types/Modules/Lessons/LessonEvaluationType";

export function coerceAttemptDate(v: unknown): Date | null {
  if (v == null) return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (
    typeof v === "object" &&
    v !== null &&
    typeof (v as { toDate?: () => Date }).toDate === "function"
  ) {
    const d = (v as { toDate: () => Date }).toDate();
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof v === "string") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export type LessonSimulationFeedback = {
  ratings: number[];
  criteriaSums: Record<string, { sum: number; count: number }>;
  strengths: { title: string; description: string }[];
  areas: string[];
  summaries: string[];
  latestAt: Date | null;
};

function pushStrengths(
  out: LessonSimulationFeedback,
  raw: unknown
): void {
  if (!Array.isArray(raw)) return;
  for (const s of raw) {
    if (s && typeof s === "object" && "title" in (s as object)) {
      const o = s as { title?: unknown; description?: unknown };
      const title = o.title != null ? String(o.title).trim() : "";
      const description =
        o.description != null ? String(o.description).trim() : "";
      if (title || description) {
        out.strengths.push({
          title: title || "Strength",
          description: description || title,
        });
      }
    } else if (typeof s === "string" && s.trim()) {
      out.strengths.push({ title: "Strength", description: s.trim() });
    }
  }
}

function pushAreas(out: LessonSimulationFeedback, raw: unknown): void {
  if (Array.isArray(raw)) {
    for (const a of raw) {
      if (a != null && String(a).trim()) {
        out.areas.push(String(a).trim());
      }
    }
  } else if (typeof raw === "string" && raw.trim()) {
    out.areas.push(raw.trim());
  }
}

function isFeedbackMessageDoc(d: Record<string, unknown>): boolean {
  const roleRaw = d.role;
  const role =
    typeof roleRaw === "string" ? roleRaw.trim().toLowerCase() : roleRaw;
  if (role === "character" || role === "user") return false;
  if (role === "assistant") return true;
  return (
    d.rating != null ||
    d.criteriaBreakdown != null ||
    d.areasForImprovement != null ||
    (typeof d.improved === "string" && d.improved.trim().length > 0) ||
    (d.strengths != null &&
      (Array.isArray(d.strengths)
        ? d.strengths.length > 0
        : typeof d.strengths === "object"))
  );
}

export async function collectLessonSimulationFeedback(
  firestore: Firestore,
  lessonAttemptId: string
): Promise<LessonSimulationFeedback> {
  const out: LessonSimulationFeedback = {
    ratings: [],
    criteriaSums: {},
    strengths: [],
    areas: [],
    summaries: [],
    latestAt: null,
  };

  for (let simIdx = 1; simIdx <= 3; simIdx++) {
    const messagesRef = collection(
      firestore,
      "simulationLessonAttempts",
      lessonAttemptId,
      "simulations",
      `sim_${simIdx}`,
      "messages"
    );
    const snap = await getDocs(messagesRef);
    snap.forEach((m) => {
      const d = m.data() as Record<string, unknown>;
      if (!isFeedbackMessageDoc(d)) return;
      const r = d.rating;
      if (r != null) {
        const n = typeof r === "number" ? r : parseInt(String(r), 10);
        if (!Number.isNaN(n)) out.ratings.push(n);
      }
      const ts = coerceAttemptDate(d.timestamp);
      if (ts && (!out.latestAt || ts > out.latestAt)) out.latestAt = ts;

      const cb = d.criteriaBreakdown;
      if (cb && typeof cb === "object") {
        for (const [k, v] of Object.entries(cb as Record<string, unknown>)) {
          if (v == null) continue;
          const num = typeof v === "number" ? v : parseInt(String(v), 10);
          if (Number.isNaN(num)) continue;
          const cur = out.criteriaSums[k] ?? { sum: 0, count: 0 };
          cur.sum += num;
          cur.count += 1;
          out.criteriaSums[k] = cur;
        }
      }

      pushStrengths(out, d.strengths);
      pushAreas(out, d.areasForImprovement);

      const summary = d.content;
      if (typeof summary === "string" && summary.trim()) {
        out.summaries.push(summary.trim());
      }
    });
  }

  return out;
}

const LEGACY_PLACEHOLDER_STRENGTH = "Strengths appear after the AI scores";
const LEGACY_PLACEHOLDER_OVERALL = "If the lesson is complete but nothing shows";
export const EMPTY_EVAL_HINT_STRENGTHS =
  "No AI feedback was found for this lesson yet. Summaries are saved automatically after you exchange messages in each simulation part.";
export const EMPTY_EVAL_HINT_OVERALL =
  "Keep going in the simulator: each of your replies can receive a score and written feedback, which is aggregated here without opening any extra tab.";

export const MARK_COMPLETE_NO_FEEDBACK_PREFIX =
  "This lesson is marked complete, but no AI feedback was found";

export function lessonMarkedCompleteNoFeedbackEval(): LessonEvaluationType {
  return {
    strengths: `${MARK_COMPLETE_NO_FEEDBACK_PREFIX} on your saved messages.`,
    shortcomings: "—",
    overallFeedback:
      "Finishing all three parts can still happen without a scored reply (for example, the scene ended before the next evaluation was written). Tap Review, open a part, send at least one employee reply, and wait for the AI response so feedback can be saved—this panel will update afterward.",
  };
}

export function evaluationHasUserFacingContent(e: LessonEvaluationType): boolean {
  const st = (e.strengths ?? "").trim();
  const sh = (e.shortcomings ?? "").trim();
  const ov = (e.overallFeedback ?? "").trim();
  if (st.startsWith(MARK_COMPLETE_NO_FEEDBACK_PREFIX)) {
    return true;
  }
  if (st.includes(LEGACY_PLACEHOLDER_STRENGTH) || ov.includes(LEGACY_PLACEHOLDER_OVERALL)) {
    return false;
  }
  if (st === EMPTY_EVAL_HINT_STRENGTHS || ov === EMPTY_EVAL_HINT_OVERALL) {
    return false;
  }
  if (st.startsWith("No scored replies were found") && ov.startsWith("When the AI evaluates")) {
    return false;
  }
  return Boolean(st || (sh && sh !== "—") || ov);
}

export function storedPartialIsUseful(
  p: Partial<LessonEvaluationType> | null | undefined
): boolean {
  if (!p) return false;
  return evaluationHasUserFacingContent({
    strengths: p.strengths ?? "",
    shortcomings: p.shortcomings ?? "—",
    overallFeedback: p.overallFeedback ?? "",
  });
}

function dedupeStrengthRows(
  items: { title: string; description: string }[]
): { title: string; description: string }[] {
  const seen = new Set<string>();
  const out: { title: string; description: string }[] = [];
  for (const s of items) {
    const key = `${s.title.trim().toLowerCase()}|${s.description.trim().toLowerCase()}`.replace(
      /\s+/g,
      " "
    );
    if (!key.replace(/\|/g, "").trim() || seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function dedupeLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of lines) {
    const key = raw.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 200);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(raw.trim());
  }
  return out;
}

function asSentence(text: string): string {
  let t = text.replace(/\s+/g, " ").trim();
  if (!t) return "";
  t = t.replace(/^[•\-\u2022]+\s*/u, "");
  if (!t) return "";
  if (!/[.!?]$/.test(t)) t += ".";
  return t;
}

function strengthToSentence(s: { title: string; description: string }): string {
  const title = s.title.trim();
  const desc = s.description.trim();
  if (desc.length >= 28) {
    return asSentence(desc);
  }
  if (title && desc && title.toLowerCase() !== desc.toLowerCase()) {
    return asSentence(`${title}: ${desc}`);
  }
  return asSentence(title || desc);
}

function takeSentences(paragraph: string, max: number): string {
  const t = paragraph.replace(/\r\n/g, " ").replace(/\s+/g, " ").trim();
  if (!t) return "";
  const parts = t.split(/(?<=[.!?])\s+/).filter((x) => x.trim());
  return parts.slice(0, max).join(" ").trim();
}

function joinSummarySentences(sentences: string[], maxSentences: number): string {
  const cleaned = sentences.map((s) => asSentence(s)).filter(Boolean);
  const joined = cleaned.join(" ");
  return takeSentences(joined, maxSentences);
}

export type LessonEvalOptions = {
  lessonMarkedComplete?: boolean;
};

export function lessonEvaluationFromAggregatedFeedback(
  fb: LessonSimulationFeedback,
  existing?: Partial<LessonEvaluationType> | null,
  options?: LessonEvalOptions
): LessonEvaluationType {
  const uniqueStrengths = dedupeStrengthRows(fb.strengths);
  const strengthBits = uniqueStrengths
    .slice(0, 6)
    .map(strengthToSentence)
    .filter(Boolean);
  const strengthsText = joinSummarySentences(strengthBits, 3);

  const uniqueAreas = dedupeLines(fb.areas);
  const areaBits = uniqueAreas.slice(0, 5).map((a) => asSentence(a)).filter(Boolean);
  const shortcomingsText = joinSummarySentences(areaBits, 2);

  let overallFeedback = "";
  if (fb.summaries.length > 0) {
    const condensed = takeSentences(fb.summaries[fb.summaries.length - 1], 4);
    overallFeedback = condensed;
  }

  if (fb.ratings.length > 0) {
    const avg = fb.ratings.reduce((a, b) => a + b, 0) / fb.ratings.length;
    const n = fb.ratings.length;
    const scoreSentence = asSentence(
      `Across ${n} scored repl${n === 1 ? "y" : "ies"}, your average was ${avg.toFixed(1)} out of 10`
    );
    overallFeedback = overallFeedback
      ? `${overallFeedback} ${scoreSentence}`
      : scoreSentence;
  }

  const ex = storedPartialIsUseful(existing) ? (existing ?? {}) : {};
  const merged: LessonEvaluationType = {
    strengths: strengthsText || (ex.strengths?.trim() ?? ""),
    shortcomings:
      shortcomingsText || (ex.shortcomings?.trim() ?? "") || "—",
    overallFeedback: overallFeedback || (ex.overallFeedback?.trim() ?? ""),
  };

  const hasShortcomings =
    Boolean(merged.shortcomings) && merged.shortcomings !== "—";

  if (!merged.strengths && !hasShortcomings && !merged.overallFeedback) {
    if (options?.lessonMarkedComplete) {
      return lessonMarkedCompleteNoFeedbackEval();
    }
    return {
      strengths: EMPTY_EVAL_HINT_STRENGTHS,
      shortcomings: "—",
      overallFeedback: EMPTY_EVAL_HINT_OVERALL,
    };
  }

  return merged;
}

export async function persistSimulationLessonEvaluation(
  firestore: Firestore,
  lessonAttemptId: string
): Promise<void> {
  const lessonRef = doc(firestore, "simulationLessonAttempts", lessonAttemptId);
  const lessonSnap = await getDoc(lessonRef);
  const rawEval = lessonSnap.data()?.evaluation as Partial<LessonEvaluationType> | undefined;
  const mergeFrom = storedPartialIsUseful(rawEval) ? rawEval : undefined;
  const lessonMarkedComplete = lessonSnap.data()?.status === "completed";
  const fb = await collectLessonSimulationFeedback(firestore, lessonAttemptId);
  const evaluation = lessonEvaluationFromAggregatedFeedback(fb, mergeFrom, {
    lessonMarkedComplete: Boolean(lessonMarkedComplete),
  });
  if (!evaluationHasUserFacingContent(evaluation)) return;
  await updateDoc(lessonRef, { evaluation });
}

export function criterionLabel(key: string): string {
  const map: Record<string, string> = {
    skillApplication: "Skill application",
    communicationQuality: "Communication quality",
    policyAdherence: "Policy adherence",
    emotionalIntelligence: "Emotional intelligence",
    storeAlignment: "Store alignment",
  };
  if (map[key]) return map[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
