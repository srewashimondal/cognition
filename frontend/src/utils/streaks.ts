import {
  collection,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  BADGE_CATALOG,
  BADGE_IDS,
  EARLY_BIRD_END_HOUR,
  WELCOME_BACK_MIN_GAP_DAYS,
  type AchievementEntry,
  type BadgeType,
  type EmployeeUserType,
  type LearningStreak,
} from "../types/User/UserType";

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function updateLearningStreakForUser(userId: string): Promise<LearningStreak> {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    throw new Error("User not found when updating learning streak");
  }

  const data = snap.data() as { learningStreak?: LearningStreak };

  const existing: LearningStreak = data.learningStreak ?? {
    current: 0,
    longest: 0,
    lastActiveDate: null,
  };

  const today = todayDateString();
  const yesterday = yesterdayDateString();

  let current = existing.current ?? 0;

  if (existing.lastActiveDate === today) {
    current = current || 1;
  } else if (existing.lastActiveDate === yesterday) {
    current = current + 1;
  } else {
    current = 1;
  }

  const longest = Math.max(existing.longest ?? 0, current);

  const updated: LearningStreak = {
    current,
    longest,
    lastActiveDate: today,
  };

  await updateDoc(userRef, { learningStreak: updated });

  return updated;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const HIGH_SCORE_WINDOW = 10;
const SIM_PRO_LESSON_COUNT = 5;
const WEEK_UNIQUE_DAYS = 5;
const FIVE_DAYS_UNIQUE = 5;

export function isBadgeMap(entry: AchievementEntry): entry is BadgeType {
  return !(entry instanceof DocumentReference);
}

function toMillis(val: unknown): number | null {
  if (val == null) return null;
  if (val instanceof Timestamp) return val.toMillis();
  if (
    typeof val === "object" &&
    val !== null &&
    "toMillis" in val &&
    typeof (val as Timestamp).toMillis === "function"
  ) {
    return (val as Timestamp).toMillis();
  }
  if (typeof val === "string") {
    const t = Date.parse(val);
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

function isoDateLocal(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isoWeekMondayKey(ms: number): string {
  const d = new Date(ms);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return isoDateLocal(monday.getTime());
}

function mergeAchievements(existing: AchievementEntry[], earnedIds: Set<string>): AchievementEntry[] {
  const byId = new Map<string, BadgeType>();
  const refs: DocumentReference[] = [];
  for (const e of existing) {
    if (isBadgeMap(e)) {
      byId.set(e.id, e);
    } else {
      refs.push(e);
    }
  }
  for (const id of earnedIds) {
    const def = BADGE_CATALOG[id];
    if (def) {
      byId.set(id, def);
    }
  }
  return [...refs, ...byId.values()];
}

type Aggregate = {
  trainingDates: Set<string>;
  completionTimesMs: number[];
  scoredQuizAttempts: { score: number; at: number }[];
  completedStandardLessonCount: number;
  completedSimLessonCount: number;
  anyModuleFullyDone: boolean;
  anyPerfectScore: boolean;
  anyEarlyBird: boolean;
  hasStandardModuleComplete: boolean;
  hasSimulationModuleComplete: boolean;
};

async function aggregateEmployeeActivity(userId: string): Promise<Aggregate> {
  const userRef = doc(db, "users", userId);

  const trainingDates = new Set<string>();
  const completionTimesMs: number[] = [];
  const scoredQuizAttempts: { score: number; at: number }[] = [];

  let completedStandardLessonCount = 0;
  let completedSimLessonCount = 0;
  let anyModuleFullyDone = false;
  let anyPerfectScore = false;
  let anyEarlyBird = false;
  let hasStandardModuleComplete = false;
  let hasSimulationModuleComplete = false;

  const stdMods = await getDocs(
    query(collection(db, "standardModuleAttempts"), where("user", "==", userRef))
  );

  for (const mDoc of stdMods.docs) {
    const lessons = await getDocs(
      query(collection(db, "standardLessonAttempts"), where("moduleRef", "==", mDoc.ref))
    );
    let done = 0;
    const total = lessons.size;
    for (const lDoc of lessons.docs) {
      const d = lDoc.data() as {
        status?: string;
        completedAt?: unknown;
        score?: number | null;
      };
      if (d.status !== "completed") continue;

      completedStandardLessonCount++;
      done++;

      const ms = toMillis(d.completedAt);
      if (ms != null) {
        completionTimesMs.push(ms);
        trainingDates.add(isoDateLocal(ms));

        const localHour = new Date(ms).getHours();
        if (localHour < EARLY_BIRD_END_HOUR) {
          anyEarlyBird = true;
        }

        if (typeof d.score === "number" && !Number.isNaN(d.score)) {
          scoredQuizAttempts.push({ score: d.score, at: ms });
          if (d.score === 100) {
            anyPerfectScore = true;
          }
        }
      }
    }
    if (total > 0 && done === total) {
      anyModuleFullyDone = true;
      hasStandardModuleComplete = true;
    }
  }

  const simMods = await getDocs(
    query(collection(db, "simulationModuleAttempts"), where("user", "==", userRef))
  );

  for (const mDoc of simMods.docs) {
    const lessons = await getDocs(
      query(collection(db, "simulationLessonAttempts"), where("moduleRef", "==", mDoc.ref))
    );
    let done = 0;
    const total = lessons.size;
    for (const lDoc of lessons.docs) {
      const d = lDoc.data() as { status?: string; completedAt?: unknown };
      if (d.status !== "completed") continue;

      completedSimLessonCount++;
      done++;

      const ms = toMillis(d.completedAt);
      if (ms != null) {
        completionTimesMs.push(ms);
        trainingDates.add(isoDateLocal(ms));

        const localHour = new Date(ms).getHours();
        if (localHour < EARLY_BIRD_END_HOUR) {
          anyEarlyBird = true;
        }
      }
    }
    if (total > 0 && done === total) {
      anyModuleFullyDone = true;
      hasSimulationModuleComplete = true;
    }
  }

  return {
    trainingDates,
    completionTimesMs,
    scoredQuizAttempts,
    completedStandardLessonCount,
    completedSimLessonCount,
    anyModuleFullyDone,
    anyPerfectScore,
    anyEarlyBird,
    hasStandardModuleComplete,
    hasSimulationModuleComplete,
  };
}

function evaluateWeekStreakBadge(trainingDates: Set<string>): boolean {
  const byWeek = new Map<string, Set<string>>();
  for (const dateStr of trainingDates) {
    const ms = Date.parse(`${dateStr}T12:00:00`);
    if (Number.isNaN(ms)) continue;
    const wk = isoWeekMondayKey(ms);
    if (!byWeek.has(wk)) {
      byWeek.set(wk, new Set());
    }
    byWeek.get(wk)!.add(dateStr);
  }
  for (const days of byWeek.values()) {
    if (days.size >= WEEK_UNIQUE_DAYS) {
      return true;
    }
  }
  return false;
}

function evaluateWelcomeBack(completionTimesMs: number[]): boolean {
  if (completionTimesMs.length < 2) return false;
  const sorted = [...completionTimesMs].sort((a, b) => a - b);
  const latest = sorted[sorted.length - 1];
  const before = sorted.filter((t) => t < latest);
  if (before.length === 0) return false;
  const prev = Math.max(...before);
  return latest - prev >= WELCOME_BACK_MIN_GAP_DAYS * MS_PER_DAY;
}

function evaluateHighScore(scored: { score: number; at: number }[]): boolean {
  if (scored.length < HIGH_SCORE_WINDOW) return false;
  const sorted = [...scored].sort((a, b) => b.at - a.at);
  const last10 = sorted.slice(0, HIGH_SCORE_WINDOW);
  const avg = last10.reduce((s, p) => s + p.score, 0) / last10.length;
  return avg >= 90;
}

function collectEarnedIds(a: Aggregate): Set<string> {
  const earned = new Set<string>();

  const totalLessons = a.completedStandardLessonCount + a.completedSimLessonCount;
  if (totalLessons === 1) {
    earned.add(BADGE_IDS.firstLesson);
  }

  if (a.anyModuleFullyDone) {
    earned.add(BADGE_IDS.moduleDone);
  }

  if (a.anyPerfectScore) {
    earned.add(BADGE_IDS.perfectScore);
  }

  if (a.trainingDates.size >= FIVE_DAYS_UNIQUE) {
    earned.add(BADGE_IDS.fiveDays);
  }

  if (evaluateWelcomeBack(a.completionTimesMs)) {
    earned.add(BADGE_IDS.welcomeBack);
  }

  if (a.anyEarlyBird) {
    earned.add(BADGE_IDS.earlyBird);
  }

  if (evaluateWeekStreakBadge(a.trainingDates)) {
    earned.add(BADGE_IDS.weekStreak);
  }

  if (a.completedSimLessonCount >= SIM_PRO_LESSON_COUNT) {
    earned.add(BADGE_IDS.simPro);
  }

  if (evaluateHighScore(a.scoredQuizAttempts)) {
    earned.add(BADGE_IDS.highScore);
  }

  if (a.hasStandardModuleComplete && a.hasSimulationModuleComplete) {
    earned.add(BADGE_IDS.allRounder);
  }

  return earned;
}

export async function syncEmployeeAchievements(userId: string): Promise<void> {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const data = snap.data() as Partial<EmployeeUserType>;
  if (data.role !== "employee") return;

  const aggregate = await aggregateEmployeeActivity(userId);
  const earnedIds = collectEarnedIds(aggregate);

  const existing = (data.achievements ?? []) as AchievementEntry[];
  const merged = mergeAchievements(existing, earnedIds);

  await updateDoc(userRef, { achievements: merged });
}
