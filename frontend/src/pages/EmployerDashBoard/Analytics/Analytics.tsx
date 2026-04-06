import './Analytics.css';
import '../EmployerHome/EmployerHome.css';
/*import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';*/
import { useEffect, useId, useMemo, useState } from "react";
import search_icon from '../../../assets/icons/lesson-edit/grey-search.svg';
import { Tooltip } from "@radix-ui/themes";

import trending_up from '../../../assets/icons/green-trending-up-icon.svg';
import trending_down from '../../../assets/icons/red-trending-down-icon.svg';
import chart_icon from '../../../assets/icons/white-line-chart-icon.svg';
import prize_icon from '../../../assets/icons/badges/white-medal-icon.svg';
import clock_icon from '../../../assets/icons/white-clock-icon.svg';
import lessons_completed from '../../../assets/icons/white-lessons-completed-icon.svg';
import star_icon from '../../../assets/icons/badges/star-icon.svg';
import bolt_icon from '../../../assets/icons/badges/bolt-icon.svg';
import map_icon from '../../../assets/icons/badges/map-icon.svg';
import right_arrow from '../../../assets/icons/white-right-arrow.svg';
import ai_icon from '../../../assets/icons/simulations/white-ai-icon.svg';

import black_clock from '../../../assets/icons/simulations/black-clock-icon.svg';
import bar_chart_icon from '../../../assets/icons/black-bar-chart-icon.svg';
import black_prize from '../../../assets/icons/badges/black-medal-icon-1.svg';
import type { EmployeeUserType } from '../../../types/User/UserType';
import {collection, query, where, doc, onSnapshot, getDocs, getDoc,type Firestore} from "firebase/firestore";
import { db } from "../../../firebase";
import { useWorkspace } from "../../../context/WorkspaceProvider";

const API_BASE = "http://127.0.0.1:8000";

type ApiInsight = { title: string; description: string; suggestion: string };

type EmployerInsightRow = {
  title: string;
  tag: string;
  tagColor: "yellow" | "blue" | "green" | "red";
  analysis: string;
  impact: string;
  recommendedActions: string[];
};

function employeeFirstName(fullName: string): string {
  const p = fullName.trim().split(/\s+/);
  return p[0] || fullName || "They";
}

function coachImpactForInsight(i: ApiInsight, fullName: string): string {
  const fn = employeeFirstName(fullName);
  const d = (i.description || "").trim();
  const s = (i.suggestion || "").trim();
  const t = i.title;

  const join = (parts: string[]) => parts.filter(Boolean).join(" ");

  if (t.includes("Get started")) {
    return join([
      `${fn} has not finished enough lessons yet for deep coaching signals here.`,
      s || "Have them complete at least one simulation or standard lesson so strengths and gaps surface automatically.",
    ]);
  }
  if (t.includes("Simulation performance")) {
    return join([
      `Use these numbers with ${fn} in your next check-in: ${d}`,
      `Ask which moment in the scenario felt hardest so feedback targets behavior, not just the score.`,
    ]);
  }
  if (t.includes("Strength")) {
    return join([
      `Specific strength for ${fn} from simulation feedback: ${d}`,
      `Name it in your next 1:1 and tie it to one on-floor behavior you want others to copy.`,
    ]);
  }
  if (t.includes("Area to improve") || t.includes("Review opportunity")) {
    return join([
      `Make this the single focus for ${fn} before assigning more content: ${d}`,
      s,
    ]);
  }
  if (t.includes("Standard modules")) {
    return join([
      `Shows how ${fn} is doing on structured lessons and checks: ${d}`,
      s,
    ]);
  }
  if (t.includes("criterion") || t.includes("Strongest criterion")) {
    return join([
      `You can delegate shadowing or peer tips in this area while ${fn} shores up weaker criteria: ${d}`,
      s,
    ]);
  }
  return join([d, s]);
}

function mapApiInsightToEmployerRow(i: ApiInsight, fullName: string): EmployerInsightRow {
  const t = i.title;
  let tag = "Coaching insight";
  let tagColor: EmployerInsightRow["tagColor"] = "blue";
  if (t.includes("Strength")) {
    tag = "Strength";
    tagColor = "green";
  } else if (t.includes("Area to improve") || t.includes("Review opportunity")) {
    tag = "Development focus";
    tagColor = "yellow";
  } else if (t.includes("Simulation")) {
    tag = "Simulations";
    tagColor = "blue";
  } else if (t.includes("Standard")) {
    tag = "Standard training";
    tagColor = "blue";
  } else if (t.includes("criterion")) {
    tag = "Criteria";
    tagColor = "blue";
  } else if (t.includes("Get started")) {
    tag = "Next step";
    tagColor = "yellow";
  }
  return {
    title: i.title,
    tag,
    tagColor,
    analysis: i.description,
    impact: coachImpactForInsight(i, fullName),
    recommendedActions: i.suggestion ? [i.suggestion] : ["Continue assigned training and revisit weak areas in 1:1s."],
  };
}

//To Do
  /*const initialTodos = [
  {
    id: 1,
    title: "Role Responsibilities",
    date: "Tuesday, 30 June 2025",
    completed: false,
  },
  {
    id: 2,
    title: "Workplace Policies",
    date: "Monday, 24 June 2025",
    completed: false,
  },
  {
    id: 3,
    title: "Retail Basics 101",
    date: "Friday, 10 June 2025",
    completed: true,
  },
  {
    id: 4,
    title: "Handling Objections",
    date: "Friday, 05 June 2025",
    completed: true,
  },
  ];*/


type BadgeIcon = "star" | "bolt" | "map";

function parseHours(hoursStr: string): number {
  if (!hoursStr || typeof hoursStr !== "string") return 0;
  const [h, m] = hoursStr.trim().split(":").map(Number);
  return (h || 0) + (m || 0) / 60;
}

function getMonthKey(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getCompletionDateStr(m: { completionDate?: string | { toDate?: () => Date } }): string | undefined {
  const c = m.completionDate;
  if (!c) return undefined;
  if (typeof c === "string") return c;
  if (c && typeof c === "object" && typeof (c as { toDate?: () => Date }).toDate === "function") {
    return (c as { toDate: () => Date }).toDate().toISOString();
  }
  return undefined;
}

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getLastMonths(count: number): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: SHORT_MONTHS[d.getMonth()],
    });
  }
  return out;
}

function completionsInRange(
  modules: EmployeeUserType["completedModules"] | undefined,
  start: Date,
  end: Date
) {
  if (!modules?.length) return [];
  const t0 = start.getTime();
  const t1 = end.getTime();
  return modules.filter((m) => {
    const s = getCompletionDateStr(m);
    if (!s) return false;
    const t = new Date(s).getTime();
    return !Number.isNaN(t) && t >= t0 && t < t1;
  });
}

function formatWeekTrend(prev: number, curr: number): { text: string; tone: "up" | "down" | "flat" | "muted" } {
  if (prev === 0 && curr === 0) return { text: "No completions this week", tone: "muted" };
  if (prev === 0 && curr > 0) return { text: `+${curr} vs last week`, tone: "up" };
  const delta = curr - prev;
  const pct = Math.round((delta / prev) * 100);
  if (delta === 0) return { text: "Same as last week", tone: "flat" };
  const sign = delta > 0 ? "+" : "";
  return {
    text: `${sign}${pct}% vs last week`,
    tone: delta > 0 ? "up" : "down",
  };
}

function scoreTrendFromCompletions(
  modules: EmployeeUserType["completedModules"] | undefined
): { text: string; tone: "up" | "down" | "flat" | "muted" } {
  const now = new Date();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const thisWeek = completionsInRange(modules, new Date(now.getTime() - weekMs), now);
  const prevWeek = completionsInRange(modules, new Date(now.getTime() - 2 * weekMs), new Date(now.getTime() - weekMs));
  const avg = (list: typeof thisWeek) => {
    const scores = list.map((m) => m.score).filter((s): s is number => typeof s === "number" && !Number.isNaN(s));
    if (!scores.length) return null;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };
  const a0 = avg(prevWeek);
  const a1 = avg(thisWeek);
  if (a0 == null && a1 == null) return { text: "Not enough recent data", tone: "muted" };
  if (a0 == null && a1 != null) return { text: `Avg ${Math.round(a1)}% on recent work`, tone: "up" };
  if (a0 != null && a1 == null) return { text: "No scores this week", tone: "muted" };
  const diff = a1! - a0!;
  if (Math.abs(diff) < 1) return { text: "Score steady vs last week", tone: "flat" };
  const sign = diff > 0 ? "+" : "";
  return { text: `${sign}${Math.round(diff)}% vs last week`, tone: diff > 0 ? "up" : "down" };
}

function trendPillClass(tone: "up" | "down" | "flat" | "muted"): string {
  if (tone === "up") return "analytics-change-pill green";
  if (tone === "down") return "analytics-change-pill red";
  return "analytics-change-pill neutral";
}


type AttemptScorePoint = {
  at: Date;
  score: number;
  kind: "simulation" | "standard";
};

type PerformanceGranularity = "yearly" | "monthly" | "daily";

type PerformanceBucket = {
  label: string;
  key: string;
  avgScore: number;
  count: number;
};

function coerceAttemptDate(v: unknown): Date | null {
  if (v == null) return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (typeof v === "object" && v !== null && typeof (v as { toDate?: () => Date }).toDate === "function") {
    const d = (v as { toDate: () => Date }).toDate();
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof v === "string") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

async function collectSimulationRatingsForLesson(
  firestore: Firestore,
  lessonAttemptId: string
): Promise<{ avgRating: number; at: Date } | null> {
  const ratings: number[] = [];
  let latest: Date | null = null;

  for (let simIdx = 1; simIdx <= 3; simIdx++) {
    const messagesRef = collection(
      firestore,
      "simulationLessonAttempts",
      lessonAttemptId,
      "simulations",
      `sim_${simIdx}`,
      "messages"
    );
    const snap = await getDocs(query(messagesRef, where("role", "==", "assistant")));
    snap.forEach((m) => {
      const d = m.data();
      const r = d.rating;
      if (r != null) {
        const n = typeof r === "number" ? r : parseInt(String(r), 10);
        if (!Number.isNaN(n)) ratings.push(n);
      }
      const ts = coerceAttemptDate(d.timestamp);
      if (ts && (!latest || ts > latest)) latest = ts;
    });
  }

  if (!ratings.length || !latest) return null;
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  return { avgRating: avg, at: latest };
}

async function fetchEmployeeAttemptScores(
  firestore: Firestore,
  userId: string,
  workspaceId: string
): Promise<AttemptScorePoint[]> {
  const userRef = doc(firestore, "users", userId);
  const workspaceRef = doc(firestore, "workspaces", workspaceId);
  const points: AttemptScorePoint[] = [];

  const [simModSnap, stdModSnap] = await Promise.all([
    getDocs(
      query(
        collection(firestore, "simulationModuleAttempts"),
        where("user", "==", userRef),
        where("workspaceRef", "==", workspaceRef)
      )
    ),
    getDocs(
      query(
        collection(firestore, "standardModuleAttempts"),
        where("user", "==", userRef),
        where("workspaceRef", "==", workspaceRef)
      )
    ),
  ]);

  const simLessonSnaps = await Promise.all(
    simModSnap.docs.map((modDoc) =>
      getDocs(
        query(
          collection(firestore, "simulationLessonAttempts"),
          where("moduleRef", "==", modDoc.ref)
        )
      )
    )
  );

  for (const snap of simLessonSnaps) {
    for (const lessonDoc of snap.docs) {
      const agg = await collectSimulationRatingsForLesson(firestore, lessonDoc.id);
      if (!agg) continue;
      points.push({
        at: agg.at,
        score: Math.min(100, Math.round(agg.avgRating * 10)),
        kind: "simulation",
      });
    }
  }

  const stdLessonSnaps = await Promise.all(
    stdModSnap.docs.map((modDoc) =>
      getDocs(
        query(
          collection(firestore, "standardLessonAttempts"),
          where("moduleRef", "==", modDoc.ref)
        )
      )
    )
  );

  for (const snap of stdLessonSnaps) {
    for (const lessonDoc of snap.docs) {
      const data = lessonDoc.data();
      if (data.status !== "completed") continue;
      const score = data.score;
      if (score == null) continue;
      const n = typeof score === "number" ? score : parseInt(String(score), 10);
      if (Number.isNaN(n)) continue;
      const at = coerceAttemptDate(data.completedAt) ?? coerceAttemptDate(data.updatedAt);
      if (!at) continue;
      points.push({
        at,
        score: Math.min(100, Math.max(0, n)),
        kind: "standard",
      });
    }
  }

  points.sort((a, b) => a.at.getTime() - b.at.getTime());
  return points;
}

type ModulePerformanceRow = {
  id: string;
  kind: "simulation" | "standard";
  title: string;
  lessonsComplete: number;
  lessonsTotal: number;
  scorePercent: number | null;
};

async function fetchModulePerformanceRows(
  firestore: Firestore,
  userId: string,
  workspaceId: string
): Promise<ModulePerformanceRow[]> {
  const userRef = doc(firestore, "users", userId);
  const workspaceRef = doc(firestore, "workspaces", workspaceId);
  const rows: ModulePerformanceRow[] = [];

  const simModSnap = await getDocs(
    query(
      collection(firestore, "simulationModuleAttempts"),
      where("user", "==", userRef),
      where("workspaceRef", "==", workspaceRef)
    )
  );

  for (const modDoc of simModSnap.docs) {
    const data = modDoc.data();
    const moduleInfoRef = data.moduleInfo;
    let title = "Simulation module";
    if (moduleInfoRef) {
      const ms = await getDoc(moduleInfoRef);
      if (ms.exists()) {
        const md = ms.data() as { title?: string };
        if (typeof md.title === "string" && md.title) title = md.title;
      }
    }
    const lessonSnap = await getDocs(
      query(
        collection(firestore, "simulationLessonAttempts"),
        where("moduleRef", "==", modDoc.ref)
      )
    );
    const lessonsTotal = lessonSnap.size;
    if (lessonsTotal === 0) continue;

    let completed = 0;
    const lessonScores: number[] = [];
    for (const lessonDoc of lessonSnap.docs) {
      const ld = lessonDoc.data();
      if (ld.status === "completed") completed++;
      const agg = await collectSimulationRatingsForLesson(firestore, lessonDoc.id);
      if (agg) lessonScores.push(Math.min(100, Math.round(agg.avgRating * 10)));
    }
    const scorePercent =
      lessonScores.length > 0
        ? Math.round(lessonScores.reduce((a, b) => a + b, 0) / lessonScores.length)
        : null;

    rows.push({
      id: `sim-${modDoc.id}`,
      kind: "simulation",
      title,
      lessonsComplete: completed,
      lessonsTotal,
      scorePercent,
    });
  }

  const stdModSnap = await getDocs(
    query(
      collection(firestore, "standardModuleAttempts"),
      where("user", "==", userRef),
      where("workspaceRef", "==", workspaceRef)
    )
  );

  for (const modDoc of stdModSnap.docs) {
    const data = modDoc.data();
    const moduleInfoRef = data.moduleInfo;
    let title = "Standard module";
    if (moduleInfoRef) {
      const ms = await getDoc(moduleInfoRef);
      if (ms.exists()) {
        const md = ms.data() as { title?: string };
        if (typeof md.title === "string" && md.title) title = md.title;
      }
    }
    const lessonSnap = await getDocs(
      query(
        collection(firestore, "standardLessonAttempts"),
        where("moduleRef", "==", modDoc.ref)
      )
    );
    const lessonsTotal = lessonSnap.size;
    if (lessonsTotal === 0) continue;

    let completed = 0;
    const scores: number[] = [];
    lessonSnap.docs.forEach((lessonDoc) => {
      const ld = lessonDoc.data();
      if (ld.status === "completed") completed++;
      if (ld.status === "completed" && ld.score != null) {
        const n = typeof ld.score === "number" ? ld.score : parseInt(String(ld.score), 10);
        if (!Number.isNaN(n)) scores.push(Math.min(100, Math.max(0, n)));
      }
    });

    const modScore = data.score;
    let scorePercent: number | null = null;
    if (typeof modScore === "number" && !Number.isNaN(modScore)) {
      scorePercent = Math.round(modScore);
    } else if (scores.length > 0) {
      scorePercent = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    rows.push({
      id: `std-${modDoc.id}`,
      kind: "standard",
      title,
      lessonsComplete: completed,
      lessonsTotal,
      scorePercent,
    });
  }

  rows.sort((a, b) => a.title.localeCompare(b.title));
  return rows;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function bucketAttemptScores(
  points: AttemptScorePoint[],
  granularity: PerformanceGranularity,
  now = new Date()
): PerformanceBucket[] {
  if (granularity === "daily") {
    const buckets: PerformanceBucket[] = [];
    const today = startOfDay(now);
    for (let i = 29; i >= 0; i--) {
      const day = addDays(today, -i);
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
      const next = addDays(day, 1);
      const inBucket = points.filter((p) => p.at >= day && p.at < next);
      const avgScore =
        inBucket.length === 0
          ? 0
          : Math.round(inBucket.reduce((s, p) => s + p.score, 0) / inBucket.length);
      const dayIndex = 29 - i;
      const showLabel = dayIndex % 7 === 0;
      buckets.push({
        key,
        label: showLabel ? `${SHORT_MONTHS[day.getMonth()]} ${day.getDate()}` : "",
        avgScore,
        count: inBucket.length,
      });
    }
    return buckets;
  }

  if (granularity === "monthly") {
    const buckets: PerformanceBucket[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const inBucket = points.filter((p) => p.at >= start && p.at < end);
      const avgScore =
        inBucket.length === 0
          ? 0
          : Math.round(inBucket.reduce((s, p) => s + p.score, 0) / inBucket.length);
      buckets.push({
        key,
        label: SHORT_MONTHS[d.getMonth()],
        avgScore,
        count: inBucket.length,
      });
    }
    return buckets;
  }

  const buckets: PerformanceBucket[] = [];
  const y0 = now.getFullYear();
  for (let y = y0 - 4; y <= y0; y++) {
    const start = new Date(y, 0, 1);
    const end = new Date(y + 1, 0, 1);
    const inBucket = points.filter((p) => p.at >= start && p.at < end);
    const avgScore =
      inBucket.length === 0
        ? 0
        : Math.round(inBucket.reduce((s, p) => s + p.score, 0) / inBucket.length);
    buckets.push({
      key: String(y),
      label: String(y),
      avgScore,
      count: inBucket.length,
    });
  }
  return buckets;
}

function blendedAverageScore(points: AttemptScorePoint[]): number | null {
  if (!points.length) return null;
  return Math.round(points.reduce((s, p) => s + p.score, 0) / points.length);
}

function formatHoursTick(value: number): string {
  if (value <= 0) return "0 Hr";
  if (value < 1) return `${Math.round(value * 100) / 100} Hr`;
  if (value < 10) return `${Math.round(value * 10) / 10} Hr`;
  return `${Math.round(value)} Hr`;
}

function hoursChartYAxisLabels(rawMaxHours: number): string[] {
  const displayMax = rawMaxHours <= 0 ? 1 : Math.max(rawMaxHours, 0.25);
  return [1, 0.75, 0.5, 0.25, 0].map((frac) => formatHoursTick(displayMax * frac));
}

export default function Analytics() {
  const gaugeGradId = useId().replace(/:/g, "");
  const { workspace } = useWorkspace();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const iconByBadge: Record<BadgeIcon, string> = {
    star: star_icon,
    bolt: bolt_icon,
    map: map_icon,
  };

  const [employees, setEmployees] = useState<EmployeeUserType[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeUserType | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [employerInsights, setEmployerInsights] = useState<EmployerInsightRow[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const [attemptPoints, setAttemptPoints] = useState<AttemptScorePoint[]>([]);
  const [attemptPerfLoading, setAttemptPerfLoading] = useState(false);
  const [modulePerformanceRows, setModulePerformanceRows] = useState<ModulePerformanceRow[]>([]);
  const [performanceGranularity, setPerformanceGranularity] =
    useState<PerformanceGranularity>("monthly");

  useEffect(() => {
    if (!workspace?.id) return;

    const workspaceRef = doc(db, "workspaces", workspace.id);
    const q = query(
      collection(db, "users"),
      where("workspaceID", "==", workspaceRef),
      where("role", "==", "employee")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        uid: d.id,
        ...d.data(),
      })) as EmployeeUserType[];
      setEmployees(list);
    });

    return () => unsubscribe();
  }, [workspace?.id]);

  useEffect(() => {
    if (!selectedEmployee) return;
    if (!employees.some((e) => e.uid === selectedEmployee.uid)) {
      setSelectedEmployee(null);
      setSearch("");
    }
  }, [employees, selectedEmployee]);

  const filteredEmployees = employees.filter((emp) => {
    if (!search.trim()) return true;

    const term = search.toLowerCase();

    return (
      (emp.fullName ?? "").toLowerCase().includes(term) ||
      (emp.employeeID ?? "").toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    if (!selectedEmployee?.uid) return;

    const unsub = onSnapshot(
      doc(db, "users", selectedEmployee.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          setSelectedEmployee({
            uid: snapshot.id,
            ...snapshot.data(),
          } as EmployeeUserType);
        }
      }
    );

    return () => unsub();
  }, [selectedEmployee?.uid]);

  useEffect(() => {
    if (!selectedEmployee?.uid || !workspace?.id) {
      setEmployerInsights([]);
      setInsightsError(null);
      setInsightsLoading(false);
      return;
    }
    let cancelled = false;
    setInsightsLoading(true);
    setInsightsError(null);
    fetch(`${API_BASE}/ai/employee-insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: selectedEmployee.uid,
        workspace_id: workspace.id,
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Insights request failed"))))
      .then((data) => {
        if (cancelled || !Array.isArray(data?.insights)) return;
        setEmployerInsights(
          (data.insights as ApiInsight[]).map((ins) =>
            mapApiInsightToEmployerRow(ins, selectedEmployee.fullName || "This employee")
          )
        );
      })
      .catch(() => {
        if (!cancelled) {
          setInsightsError("Could not load insights. Is the API running?");
          setEmployerInsights([]);
        }
      })
      .finally(() => {
        if (!cancelled) setInsightsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    selectedEmployee?.uid,
    workspace?.id,
    selectedEmployee?.fullName,
    selectedEmployee?.completedModules?.length,
    selectedEmployee?.averageScore,
  ]);

  useEffect(() => {
    if (!selectedEmployee?.uid || !workspace?.id) {
      setAttemptPoints([]);
      setModulePerformanceRows([]);
      return;
    }
    let cancelled = false;
    setAttemptPerfLoading(true);
    Promise.all([
      fetchEmployeeAttemptScores(db, selectedEmployee.uid, workspace.id),
      fetchModulePerformanceRows(db, selectedEmployee.uid, workspace.id),
    ])
      .then(([pts, modRows]) => {
        if (!cancelled) {
          setAttemptPoints(pts);
          setModulePerformanceRows(modRows);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAttemptPoints([]);
          setModulePerformanceRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) setAttemptPerfLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    selectedEmployee?.uid,
    workspace?.id,
    selectedEmployee?.completedModules?.length,
  ]);

  const last6Months = getLastMonths(6);
  const hoursChartData = (() => {
    const map = new Map<string, { simulation: number; standard: number }>();
    last6Months.forEach(({ key }) => map.set(key, { simulation: 0, standard: 0 }));
    selectedEmployee?.completedModules?.forEach((m) => {
      const key = getMonthKey(getCompletionDateStr(m));
      if (!key || !map.has(key)) return;
      const modInfo = m.moduleInfo as { hours?: string; kind?: string };
      const hours = parseHours(modInfo?.hours ?? "0");
      const entry = map.get(key)!;
      if (modInfo?.kind === "standard") entry.standard += hours;
      else entry.simulation += hours;
    });
    return last6Months.map(({ key, label }) => ({
      month: label,
      ...(map.get(key) ?? { simulation: 0, standard: 0 }),
    }));
  })();

  const rawHoursMax = Math.max(0, ...hoursChartData.map((d) => d.simulation + d.standard));
  const hoursYAxisLabels = hoursChartYAxisLabels(rawHoursMax);
  const hoursBarScaleMax = rawHoursMax > 0 ? rawHoursMax : 1;

  const performanceBuckets = useMemo(
    () => bucketAttemptScores(attemptPoints, performanceGranularity),
    [attemptPoints, performanceGranularity]
  );

  const moduleRowsForDisplay = useMemo((): ModulePerformanceRow[] => {
    if (modulePerformanceRows.length > 0) return modulePerformanceRows;
    const legacy = selectedEmployee?.completedModules ?? [];
    return legacy.map((m, idx) => ({
      id: `profile-${(m.moduleInfo as { id?: string })?.id ?? idx}`,
      kind:
        (m.moduleInfo as { kind?: string }).kind === "standard" ? "standard" : "simulation",
      title: m.moduleInfo?.title ?? "Module",
      lessonsComplete: m.lessons?.length ?? 0,
      lessonsTotal: m.moduleInfo?.lessons?.length ?? 0,
      scorePercent: typeof m.score === "number" ? m.score : null,
    }));
  }, [modulePerformanceRows, selectedEmployee?.completedModules]);
  const maxBucketScore = Math.max(100, ...performanceBuckets.map((b) => b.avgScore), 1);

  const blendedFromAttempts = blendedAverageScore(attemptPoints);
  const perfScore100 =
    blendedFromAttempts ??
    (selectedEmployee?.averageScore != null ? selectedEmployee.averageScore : 0);
  const performanceGrade = perfScore100 / 10;
  const gaugeRotation = -90 + (performanceGrade / 10) * 180;

  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const now = new Date();
  const modulesWeekTrend = selectedEmployee
    ? formatWeekTrend(
        completionsInRange(
          selectedEmployee.completedModules,
          new Date(now.getTime() - 2 * weekMs),
          new Date(now.getTime() - weekMs)
        ).length,
        completionsInRange(
          selectedEmployee.completedModules,
          new Date(now.getTime() - weekMs),
          now
        ).length
      )
    : { text: "", tone: "muted" as const };
  const scoreWeekTrend = selectedEmployee
    ? scoreTrendFromCompletions(selectedEmployee.completedModules)
    : { text: "", tone: "muted" as const };

  return (
  <div className="employer-analytics-page">

        <div className="search-wrapper">
          <span className="analytics-search-icon">
            <img src={search_icon} />
          </span>

          <input
            className="search-input"
            placeholder="Search by Employee Name or ID"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
          />

          {isDropdownOpen && search && (
            <div className="employee-dropdown">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.uid}
                  className="employee-dropdown-item"
                  onClick={() => {
                    setSelectedEmployee(emp);
                    setSearch(emp.fullName ?? "");
                    setIsDropdownOpen(false);
                  }}
                >
                  <div className="emp-name">{emp.fullName}</div>
                  <div className="emp-role">{emp.jobTitle}</div>
                </div>
              ))}
            </div>
          )}
        </div>

    {selectedEmployee && (
    <>
      <h2>Employee Name: {selectedEmployee.fullName}</h2>

      <div className="section">
        <div className="analytics-grid">
            <div className="analytics-card">
                <div className="analytics-left">
                    <div className={trendPillClass(scoreWeekTrend.tone)}>
                    {(scoreWeekTrend.tone === "up" || scoreWeekTrend.tone === "down") && (
                    <span>
                        <img src={scoreWeekTrend.tone === "down" ? trending_down : trending_up} alt="" />
                    </span>
                    )}
                    {scoreWeekTrend.text}
                    </div>
                    <h3 className="analytics-value"> {selectedEmployee?.averageScore ?? 0}% </h3>
                    <span className="analytics-change">Average score</span>
                    <p className="analytics-label">across all lessons</p>
                </div>
                <div className="analytics-icon orange">
                    <img src={chart_icon} />
                </div>
            </div>
            <div className="analytics-card">
            <div className="analytics-left">
                <div className={trendPillClass(modulesWeekTrend.tone)}>
                {(modulesWeekTrend.tone === "up" || modulesWeekTrend.tone === "down") && (
                <span>
                    <img src={modulesWeekTrend.tone === "down" ? trending_down : trending_up} alt="" />
                </span>
                )}
                {modulesWeekTrend.text}
                </div>
                <h3 className="analytics-value"> {selectedEmployee?.completedModules?.length ?? 0}</h3>
                <span className="analytics-change">Modules completed</span>
                <p className="analytics-label">of {selectedEmployee?.assignedModules?.length ?? 0} assigned</p>
            </div>
            <div className="analytics-icon orange">
                <img src={lessons_completed} />
            </div>
            </div>

            <div className="analytics-card">
                <div className="analytics-left">
                    <h3 className="analytics-value">{selectedEmployee?.achievements?.length ?? 0}</h3>
                    <span className="analytics-change">Badges earned</span>
                    <p className="analytics-label">Keep it up!</p>
                </div>
                <div className="analytics-icon orange">
                    <img src={prize_icon} />
                </div>
            </div>

            <div className="analytics-card">
                <div className="analytics-left">
                    <h3 className="analytics-value"> {selectedEmployee?.totalHours ?? 0}</h3>
                    <span className="analytics-change">hours invested</span>
                    <p className="analytics-label">time across lessons</p>
                </div>
                <div className="analytics-icon orange">
                    <img src={clock_icon} />
                </div>
            </div>
        </div>
     </div>

      <div className="dashboard-row-wide">
        {/* Recent Course */}

        {/*<div className="card">
          <h3 className="card-title">Recent enrolled course</h3>

          <div className="course-card">
            <div className="course-icon">✏️</div>
            <div className="course-info">
              <p className="course-name">Customer Experience & Sales</p>
              <div className="progress-bar">
                <div className="progress-fill" />
              </div>
              <span className="progress-text">14/30 classes</span>
            </div>
          </div>
        </div>*/}

        
        {/*<div className="card">
          <h3 className="card-title">Your Resources</h3>

          <ul className="resource-list">
            <li><span>📄 auto-layout.pdf</span><span className="resource-size">2.5 MB</span></li>
            <li><span>📄 onboarding.ppt</span><span className="resource-size">1.2 MB</span></li>
            <li><span>🖼️ basics_ui.png</span><span className="resource-size">1.8 MB</span></li>
          </ul>

          <button className="see-more">see more</button>
        </div>*/}

        
        {/*<div className="card calendar-card">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev',
              center: 'title',
              right: 'next',
            }}
            height="auto"
            fixedWeekCount={false}
            showNonCurrentDates={false}
            events={[]}
          />
        </div>*/}
      </div>
      
      <div className="dashboard-row">

        {/* Hours Spent */}
        <div className="card hours-card">
          <div className="card-title">
            <span>
              <img src={black_clock} />
            </span>
            Hours Breakdown
          </div>

          <div className="hours-legend">
            <span><span className="dot study" /> Simulations</span>
            <span><span className="dot test" /> Standard modules</span>
          </div>

          <div className="hours-chart-wrapper">
            <div className="y-axis">
              {hoursYAxisLabels.map((label, idx) => (
                <span key={`${idx}-${label}`}>{label}</span>
              ))}
            </div>
            <div className="hours-chart">
              {hoursChartData.map((item, i) => {
                const maxH = hoursBarScaleMax;
                return (
                  <div className="bar-group" key={i}>
                    <div
                      className="bar-stack"
                      data-tooltip={`Simulations: ${item.simulation.toFixed(1)} Hr\nStandard: ${item.standard.toFixed(1)} Hr`}
                    >
                      <div className="bar study" style={{ height: `${(item.simulation / maxH) * 100}px` }} />
                      <div className="bar test" style={{ height: `${(item.standard / maxH) * 100}px` }} />
                    </div>
                    <span className="bar-label">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>


        {/* Performance */}
        <div className="card performance-card">
          <div className="card-title">
            <span>
              <img src={bar_chart_icon} />
            </span>
            Performance
          </div>

          <div className="performance-inner performance-inner--analytics">
            <div className="performance-header performance-header--analytics">
              <div className="legend legend--analytics">
                <span className="legend-dot" />
                <span>Lesson attempts (standard % · simulation ratings ×10)</span>
              </div>

              <select
                className="dropdown dropdown--analytics"
                value={performanceGranularity}
                onChange={(e) =>
                  setPerformanceGranularity(e.target.value as PerformanceGranularity)
                }
              >
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
              </select>
            </div>

            <div className="gauge-wrapper gauge-wrapper--analytics">
              <svg width="200" height="120" viewBox="0 0 200 120">
                <path
                  d="M20 100 A80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <path
                  d="M20 100 A80 80 0 0 1 180 100"
                  fill="none"
                  stroke={`url(#gaugeGrad-${gaugeGradId})`}
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${(performanceGrade / 10) * 251.2} 251.2`}
                />
                <defs>
                  <linearGradient id={`gaugeGrad-${gaugeGradId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
                {[...Array(11)].map((_, i) => {
                  const angle = (-90 + i * 18) * (Math.PI / 180);
                  const x1 = 100 + Math.cos(angle) * 58;
                  const y1 = 100 + Math.sin(angle) * 58;
                  const x2 = 100 + Math.cos(angle) * 66;
                  const y2 = 100 + Math.sin(angle) * 66;
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d1d5db" strokeWidth="1.5" />
                  );
                })}
                <line
                  x1="100"
                  y1="100"
                  x2={100 + Math.cos((gaugeRotation * Math.PI) / 180) * 52}
                  y2={100 + Math.sin((gaugeRotation * Math.PI) / 180) * 52}
                  stroke="#111827"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="100" r="8" fill="#111827" />
              </svg>
            </div>

            <div className="performance-score-summary">
              <p className="performance-score-line">
                <span className="performance-score-main">
                  Grade: <strong>{performanceGrade.toFixed(1)} / 10</strong>
                </span>
                {blendedFromAttempts != null && (
                  <span className="performance-score-sub">
                    {blendedFromAttempts}% blended across {attemptPoints.length} scored attempt
                    {attemptPoints.length === 1 ? "" : "s"} (standard % and simulation ×10).
                  </span>
                )}
              </p>
            </div>

            <div
              className={`performance-attempt-timeline performance-attempt-timeline--${performanceGranularity}`}
            >
              {attemptPerfLoading ? (
                <p className="performance-timeline-status">Loading scores from lesson attempts…</p>
              ) : attemptPoints.length === 0 ? (
                <p className="performance-timeline-status">
                  No scored attempts in Firestore yet. The gauge uses the profile average until they
                  complete standard or simulation lessons.
                </p>
              ) : (
                <div className="performance-bars-wrap">
                  <div className="performance-bars">
                    {performanceBuckets.map((b) => (
                      <div className="performance-bar-group" key={b.key}>
                        <div
                          className="performance-bar-track"
                          title={
                            b.count
                              ? `${b.avgScore}% avg · ${b.count} attempt${b.count === 1 ? "" : "s"}`
                              : "No activity in this period"
                          }
                        >
                          <div
                            className="performance-bar-fill"
                            style={{
                              height: `${(b.avgScore / maxBucketScore) * 72}px`,
                            }}
                          />
                        </div>
                        <span
                          className={
                            b.label
                              ? "performance-bar-label"
                              : "performance-bar-label performance-bar-label--placeholder"
                          }
                        >
                          {b.label || "·"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="performance-see-modules">
              <a href="#module-performance">See module breakdown below</a>
            </div>
          </div>
        </div>

        {/* To-Do List */}
        {/*<div className="card todo-card">
          <h3 className="card-title">To-Do List</h3>

          <div className="todo-list">
            {todos.map(todo => (
              <div
                key={todo.id}
                className={`todo-item ${todo.completed ? "completed" : ""}`}
              >
                <div
                  className={`checkbox ${todo.completed ? "checked" : ""}`}
                  onClick={() => toggleTodo(todo.id)}
                >
                  {todo.completed && "✓"}
                </div>

                <div className="todo-text">
                  <p className="todo-title">{todo.title}</p>
                  <span className="todo-date">{todo.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>*/}

        <div className="card badges-card">
          <div className="card-title">
            <span>
              <img src={black_prize} />
            </span>
            Badges
          </div>
          {selectedEmployee?.achievements?.length ? (
            <div className="analytics-badges-grid">
              {selectedEmployee.achievements.map((a) => (
                <div className="analytics-badge-card" key={a.id ?? a.name}>
                  <div className="analytics-badge-icon">
                    {iconByBadge[a.icon as BadgeIcon] ? (
                      <img src={iconByBadge[a.icon as BadgeIcon]} alt="" />
                    ) : (
                      <span className="badge-emoji">🏅</span>
                    )}
                  </div>
                  <h4 className="analytics-badge-name">{a.name}</h4>
                  <p className="analytics-badge-desc">{a.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="analytics-badges-empty">
              <div className="analytics-badges-empty-icon">🏆</div>
              <p>No badges yet</p>
              <span>Complete modules and simulations to earn badges.</span>
            </div>
          )}
        </div>

      </div> 


      {/* 3RD ROW */}
      <div className="dashboard-row-modules">

        {/* Recent Enrolled Training Modules */}
        {/*<div className="card modules-card">
          <div className="modules-header">
            <h3 className="card-title">Recent enrolled training modules</h3>
            <span className="view-all">All</span>
            <button className="search-btn">🔍︎</button>
          </div>

          <div className="module-item active">
            <div className="module-icon">✉</div>
            <div className="module-info">
              <p className="module-title">Workplace Policies</p>
              <div className="module-meta">
                <span>⏱ 5:30hrs</span>
                <span>📄 05 Lessons</span>
                <span>📝 Assignments</span>
              </div>
            </div>
          </div>

          <div className="module-item">
            <div className="module-icon">💬</div>
            <div className="module-info">
              <p className="module-title">Greeting & Engagement Techniques</p>
              <div className="module-meta">
                <span>⏱ 4:00hrs</span>
                <span>📄 03 Lessons</span>
                <span>📝 Assignments</span>
              </div>
            </div>
          </div>
        </div> */}

        {/* Upcoming Module */}
        {/*<div className="card upcoming-card">
          <h3 className="card-title">Upcoming Module</h3>

          <div className="upcoming-item">
            <div className="upcoming-left">
              <span className="upcoming-icon">🎓</span>
              <div>
                <p className="upcoming-title">Inventory Awareness</p>
                <span className="upcoming-time">5:30pm</span>
              </div>
            </div>
            <button className="join-btn">Join</button>
          </div>

          <div className="upcoming-item">
            <div className="upcoming-left">
              <span className="upcoming-icon">📋</span>
              <div>
                <p className="upcoming-title">Stockroom Best Practices</p>
                <span className="upcoming-time">9:00pm</span>
              </div>
            </div>
            <button className="join-btn light">Join</button>
          </div> 
        </div> */}

      </div>

      <div className="ai-powered-insights employer-view">
        <div className="ai-powered-insights-top">
            <div className="ai-icon-wrapper">
                <img src={ai_icon} />
            </div>
            <div className="ai-powered-insights-title">
                <h3>AI-Powered Insights</h3>
                <p>Data-driven recommendations for coaching {selectedEmployee.fullName}</p>
            </div>
        </div>
        <div className="ai-feedback-list">
          {insightsLoading && (
            <p className="insights-status">Loading insights from their attempts…</p>
          )}
          {insightsError && !insightsLoading && (
            <p className="insights-status insights-status-error">{insightsError}</p>
          )}
          {!insightsLoading &&
            !insightsError &&
            employerInsights.length === 0 && (
            <p className="insights-status">No insights returned for this employee yet.</p>
          )}
          {!insightsLoading &&
            !insightsError &&
            employerInsights.map((a, idx) => (
            <div className="ai-feedback-item" key={`${a.title}-${idx}`}>
              <div className="ai-feedback-item-title">
                <h4>{a.title}</h4>
                <div className={`ai-feedback-item-tag-pill ${a.tagColor}`}>{a.tag}</div>
              </div>
              <div className="ai-feedback-item-info">
                <p className="bold">📊 Analysis:</p>
                <p>{a.analysis}</p>
              </div>
              <div className="ai-feedback-item-info">
                <p className="bold">💡 For managers:</p>
                <p>{a.impact}</p>
              </div>
              <div className="improved-msg ai">
                  <div className="blue-thing ai employer-view" />
                  <div className="improved-msg-content ai employer-view">
                      <p className="title">Recommended actions:</p>
                      <ul>
                        {a.recommendedActions.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="skill-breakdown-section" id="module-performance">
        <h2 className="section-title margin">Module Performance</h2>
        <p className="analytics-label">How {selectedEmployee.fullName} is performing across modules</p>
        <div className="employee-breakdown employer-view">
          {attemptPerfLoading && (
            <p className="module-performance-status">Loading modules from assigned attempts…</p>
          )}
          {!attemptPerfLoading && moduleRowsForDisplay.length === 0 && (
            <div className="module-performance-empty">
              <p>No module attempts found for this employee yet.</p>
              <span>
                This list reads from simulation and standard module attempts in Firestore. If they are
                enrolled but have not started, nothing appears here until they begin a module.
              </span>
            </div>
          )}
          {!attemptPerfLoading &&
            moduleRowsForDisplay.map((row) => (
              <div className="employee-module-item" key={row.id}>
                <div className="employee-module-item-left">
                  <h4>{row.title}</h4>
                  <p>
                    {row.lessonsComplete} of {row.lessonsTotal} lessons complete
                    <span className="module-performance-kind">
                      {" "}
                      · {row.kind === "simulation" ? "Simulation" : "Standard"}
                    </span>
                  </p>
                </div>
                <div className="employee-module-item-right">
                  <div className="employee-module-item-score">
                    <h2>{row.scorePercent != null ? `${row.scorePercent}%` : "—"}</h2>
                    <p>{row.scorePercent != null ? "Score (attempts)" : "No score yet"}</p>
                  </div>
                  <Tooltip content="Scores from lesson attempts; profile totals may differ">
                    <div className="arrow-cta">
                      <img src={right_arrow} alt="" />
                    </div>
                  </Tooltip>
                </div>
              </div>
            ))}
        </div>
      </div>

     </>
    )}
  </div>
  );
}