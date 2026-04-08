import './SimulationPerformance.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../../../firebase";
import { getAuth } from "firebase/auth";
import type { LessonType } from '../../../../../types/Modules/Lessons/LessonType';
import back_arrow from '../../../../../assets/icons/orange-left-arrow.svg';
import ActionButton from '../../../../../components/ActionButton/ActionButton';
import {
  collectLessonSimulationFeedback,
  criterionLabel,
} from "../../../../../utils/simulationFeedback";

const CRITERION_BENCHMARK_PCT = 70;

type LessonRow = {
  lessonAttemptId: string;
  title: string;
  responseCount: number;
  accuracyPct: number | null;
};

export default function SimulationPerformance() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');

  const [moduleTitle, setModuleTitle] = useState("");
  const [modulePercent, setModulePercent] = useState(0);
  const [error, setError] = useState<"none" | "notfound" | "forbidden">("none");
  const [loading, setLoading] = useState(true);

  const [overallScore100, setOverallScore100] = useState(0);
  const [completionLabel, setCompletionLabel] = useState<string>("—");
  const [timeSpentLabel, setTimeSpentLabel] = useState("0 min");
  const [totalRatedResponses, setTotalRatedResponses] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [lessonRows, setLessonRows] = useState<LessonRow[]>([]);
  const [criteriaBars, setCriteriaBars] = useState<
    { key: string; label: string; scorePct: number; benchmark: number }[]
  >([]);
  const [strengthCards, setStrengthCards] = useState<{ title: string; description: string }[]>([]);
  const [areaCards, setAreaCards] = useState<string[]>([]);
  const [overallSummary, setOverallSummary] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    if (!moduleId) return;

    const auth = getAuth();

    (async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        setError("notfound");
        return;
      }

      const modRef = doc(db, "simulationModuleAttempts", moduleId);
      const modSnap = await getDoc(modRef);

      if (!modSnap.exists()) {
        setError("notfound");
        setLoading(false);
        return;
      }

      const modData = modSnap.data();
      const ownerRef = modData.user;
      if (!ownerRef || ownerRef.id !== user.uid) {
        setError("forbidden");
        setLoading(false);
        return;
      }

      setError("none");

      const infoRef = modData.moduleInfo;
      let title = "Simulation module";
      if (infoRef) {
        const infoSnap = await getDoc(infoRef);
        if (infoSnap.exists()) {
          const t = (infoSnap.data() as { title?: string }).title;
          if (typeof t === "string" && t) title = t;
        }
      }
      setModuleTitle(title);
      setModulePercent(
        typeof modData.percent === "number" ? modData.percent : 0
      );

      const lessonsSnap = await getDocs(
        query(
          collection(db, "simulationLessonAttempts"),
          where("moduleRef", "==", modRef)
        )
      );

      type Enriched = {
        lessonAttemptId: string;
        order: number;
        title: string;
        status: string;
        durationMin: number;
        feedback: Awaited<ReturnType<typeof collectLessonSimulationFeedback>>;
      };

      const enriched: Enriched[] = [];

      for (const d of lessonsSnap.docs) {
        const attemptData = d.data();
        const lessonInfoRef = attemptData.lessonInfo;
        let lessonMeta: LessonType | null = null;
        if (lessonInfoRef) {
          const ls = await getDoc(lessonInfoRef);
          if (ls.exists()) {
            lessonMeta = { id: ls.id, ...(ls.data() as Omit<LessonType, "id">) };
          }
        }
        const titleLesson =
          lessonMeta?.title ?? `Lesson ${enriched.length + 1}`;
        const feedback = await collectLessonSimulationFeedback(db, d.id);
        enriched.push({
          lessonAttemptId: d.id,
          order: lessonMeta?.orderNumber ?? 0,
          title: titleLesson,
          status: attemptData.status ?? "not begun",
          durationMin: lessonMeta?.duration ?? 0,
          feedback,
        });
      }

      enriched.sort((a, b) => a.order - b.order);

      const allRatings: number[] = [];
      const critAgg: Record<string, { sum: number; count: number }> = {};
      const strengthPool: { title: string; description: string }[] = [];
      const areaPool: string[] = [];
      const summaries: string[] = [];
      let latest: Date | null = null;
      let done = 0;
      let minutes = 0;

      const rows: LessonRow[] = [];

      for (const L of enriched) {
        if (L.status === "completed") {
          done++;
          minutes += L.durationMin;
        }
        allRatings.push(...L.feedback.ratings);
        for (const s of L.feedback.strengths) strengthPool.push(s);
        areaPool.push(...L.feedback.areas);
        summaries.push(...L.feedback.summaries);

        for (const [k, v] of Object.entries(L.feedback.criteriaSums)) {
          const cur = critAgg[k] ?? { sum: 0, count: 0 };
          cur.sum += v.sum;
          cur.count += v.count;
          critAgg[k] = cur;
        }
        if (L.feedback.latestAt && (!latest || L.feedback.latestAt > latest)) {
          latest = L.feedback.latestAt;
        }

        const n = L.feedback.ratings.length;
        const avg =
          n > 0
            ? L.feedback.ratings.reduce((a, b) => a + b, 0) / n
            : null;
        rows.push({
          lessonAttemptId: L.lessonAttemptId,
          title: L.title,
          responseCount: n,
          accuracyPct:
            avg != null ? Math.min(100, Math.round(avg * 10)) : null,
        });
      }

      setLessonRows(rows);
      setCompletedLessons(done);
      setTotalLessons(enriched.length);
      setTimeSpentLabel(`${minutes} min`);
      setTotalRatedResponses(allRatings.length);

      const score100 =
        allRatings.length > 0
          ? Math.min(
              100,
              Math.round(
                (allRatings.reduce((a, b) => a + b, 0) / allRatings.length) *
                  10
              )
            )
          : 0;
      setOverallScore100(score100);

      setCompletionLabel(
        latest
          ? latest.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "—"
      );

      setCriteriaBars(
        Object.entries(critAgg)
          .filter(([, v]) => v.count > 0)
          .map(([key, v]) => ({
            key,
            label: criterionLabel(key),
            scorePct: Math.min(100, Math.round((v.sum / v.count) * 10)),
            benchmark: CRITERION_BENCHMARK_PCT,
          }))
      );

      const seenStrength = new Set<string>();
      const uniqStrengths: { title: string; description: string }[] = [];
      for (const s of strengthPool) {
        const k = `${s.title}|${s.description}`;
        if (seenStrength.has(k)) continue;
        seenStrength.add(k);
        uniqStrengths.push(s);
        if (uniqStrengths.length >= 12) break;
      }
      setStrengthCards(uniqStrengths);

      const areaCounts = new Map<string, number>();
      for (const a of areaPool) {
        areaCounts.set(a, (areaCounts.get(a) ?? 0) + 1);
      }
      const topAreas = [...areaCounts.entries()]
        .sort((x, y) => y[1] - x[1])
        .slice(0, 6)
        .map(([text]) => text);
      setAreaCards(topAreas);

      setOverallSummary(
        summaries.length > 0 ? summaries[summaries.length - 1] : ""
      );

      setLoading(false);
    })();
  }, [moduleId]);

  const actionableInsights = useMemo(() => {
    return areaCards.slice(0, 3).map((text, i) => ({
      title:
        i === 0
          ? "Revisit frequent feedback themes"
          : i === 1
            ? "Practice similar scenarios"
            : "Review reference materials",
      description: text,
      priority: i === 0 ? ("high" as const) : i === 1 ? ("medium" as const) : ("low" as const),
    }));
  }, [areaCards]);

  const keyMetrics = useMemo(
    () => [
      {
        label: "Avg response score",
        value:
          totalRatedResponses > 0
            ? `${(overallScore100 / 10).toFixed(1)}/10`
            : "—",
        trend: "",
        positive: true,
      },
      {
        label: "Lessons completed",
        value:
          totalLessons > 0 ? `${completedLessons}/${totalLessons}` : "—",
        trend: "",
        positive: completedLessons >= totalLessons && totalLessons > 0,
      },
      {
        label: "Module progress",
        value: `${modulePercent}%`,
        trend: "",
        positive: true,
      },
      {
        label: "Scored responses",
        value: String(totalRatedResponses),
        trend: "",
        positive: totalRatedResponses > 0,
      },
    ],
    [
      overallScore100,
      totalRatedResponses,
      completedLessons,
      totalLessons,
      modulePercent,
    ]
  );

  const colorByScore = (score: number) => {
    if (score > 89) return "green";
    if (score > 79) return "blue";
    if (score > 59) return "orange";
    return "red";
  };

  if (loading) {
    return <div className="simulation-performance">Loading…</div>;
  }

  if (error === "forbidden") {
    return (
      <div className="simulation-performance">
        You do not have access to this module report.
      </div>
    );
  }

  if (error === "notfound" || !moduleId) {
    return <div className="simulation-performance">Module not found.</div>;
  }

  return (
    <div className="simulation-performance">
      <div className="performance-header">
        <div className="header-content">
          <div className="header-left">
            <button type="button" className="back-btn" onClick={() => navigate(-1)}>
              <img src={back_arrow} alt="" />
            </button>
            <div className="header-text">
              <h1>Simulation performance</h1>
              <p className="subtitle">{moduleTitle}</p>
            </div>
          </div>
          <div className="header-right">
            <div className="completion-date">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 2H2V14H14V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11 1V3M5 1V3M2 5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Last feedback {completionLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="score-overview-card">
        <div className="score-main">
          <div className="score-circle">
            <svg viewBox="0 0 120 120" className="score-svg">
              <circle cx="60" cy="60" r="54" className="score-bg-circle" />
              <circle
                cx="60"
                cy="60"
                r="54"
                className={`score-progress-circle ${colorByScore(overallScore100)}`}
                style={{
                  strokeDasharray: `${(overallScore100 / 100) * 339.292} 339.292`,
                }}
              />
            </svg>
            <div className="score-text">
              <span className={`score-number ${colorByScore(overallScore100)}`}>
                {totalRatedResponses > 0 ? overallScore100 : "—"}
              </span>
              <span className="score-label">Overall (0–100)</span>
            </div>
          </div>
          <div className="score-details">
            <div className="score-detail-item">
              <span className="detail-label">Time in lessons</span>
              <span className="detail-value">{timeSpentLabel}</span>
            </div>
            <div className="score-detail-item">
              <span className="detail-label">Scored responses</span>
              <span className="detail-value">{totalRatedResponses}</span>
            </div>
          </div>
        </div>

        <div className="key-metrics">
          {keyMetrics.map((metric, idx) => (
            <div key={idx} className="metric-item">
              <span className="metric-label">{metric.label}</span>
              <div className="metric-value-row">
                <span className="metric-value">{metric.value}</span>
                {metric.trend ? (
                  <span
                    className={`metric-trend ${metric.positive ? "positive" : "negative"}`}
                  >
                    {metric.trend}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="performance-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "detailed" ? "active" : ""}`}
          onClick={() => setActiveTab("detailed")}
        >
          Detailed analysis
        </button>
      </div>

      {activeTab === "overview" ? (
        <div className="overview-content">
          <div className="evaluation-section">
            <h2 className="section-title">Feedback highlights</h2>
            <div className="evaluation-grid">
              <div className="evaluation-box strengths">
                <div className="box-header">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 0L12.2451 7.75486H20L13.8775 12.2451L16.1225 20L10 15.5097L3.87746 20L6.12254 12.2451L0 7.75486H7.75486L10 0Z" fill="#15803d"/>
                  </svg>
                  <h3>Strengths</h3>
                </div>
                {strengthCards.length > 0 ? (
                  <div className="evaluation-text">
                    {strengthCards.map((s, idx) => (
                      <p key={idx}>
                        <strong>{s.title}</strong>
                        {s.description && s.description !== s.title
                          ? ` — ${s.description}`
                          : ""}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p>No strength notes yet. Complete simulation turns to gather feedback.</p>
                )}
              </div>

              <div className="evaluation-box shortcomings">
                <div className="box-header">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 0L10 14M10 18L10 18.01" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <h3>Areas for improvement</h3>
                </div>
                {areaCards.length > 0 ? (
                  <div className="evaluation-text">
                    {areaCards.map((a, idx) => (
                      <p key={idx}>{a}</p>
                    ))}
                  </div>
                ) : (
                  <p>No improvement themes recorded yet.</p>
                )}
              </div>
            </div>

            <div className="evaluation-box feedback">
              <div className="box-header">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2 2H18V13H6L2 17V2Z" stroke="#c2410c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>Latest summary</h3>
              </div>
              <p>
                {overallSummary ||
                  (totalRatedResponses > 0
                    ? "Open individual lessons in the module to read full feedback in the simulator."
                    : "Complete at least one scored exchange in a simulation to see summaries here.")}
              </p>
            </div>
          </div>

          {actionableInsights.length > 0 ? (
            <div className="action-items-section">
              <h2 className="section-title">Suggested focus</h2>
              <div className="action-items-grid">
                {actionableInsights.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`action-item priority-${insight.priority}`}
                  >
                    <div className="action-header">
                      <h4>{insight.title}</h4>
                      <span className={`priority-badge ${insight.priority}`}>
                        {insight.priority === "high"
                          ? "High priority"
                          : insight.priority === "medium"
                            ? "Medium"
                            : "Low"}
                      </span>
                    </div>
                    <p>{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="detailed-content">
          <div className="skill-breakdown-section">
            <h2 className="section-title">Criteria breakdown (averages)</h2>
            {criteriaBars.length > 0 ? (
              <div className="skill-bars">
                {criteriaBars.map((skill) => (
                  <div key={skill.key} className="skill-bar-item">
                    <div className="skill-bar-header">
                      <span className="skill-name">{skill.label}</span>
                      <div className="skill-scores">
                        <span className="your-score">{skill.scorePct}%</span>
                        <span className="benchmark-score">
                          Benchmark: {skill.benchmark}%
                        </span>
                      </div>
                    </div>
                    <div className="skill-bar-container">
                      <div
                        className="skill-bar-fill"
                        style={{ width: `${skill.scorePct}%` }}
                      />
                      <div
                        className="benchmark-marker"
                        style={{ left: `${skill.benchmark}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No per-criterion scores yet.</p>
            )}
          </div>

          <div className="scenario-performance-section">
            <h2 className="section-title">Performance by lesson</h2>
            <div className="scenario-grid">
              {lessonRows.map((row) => (
                <div key={row.lessonAttemptId} className="scenario-card">
                  <h4>{row.title}</h4>
                  <div className="scenario-stats">
                    <div className="scenario-accuracy">
                      <span className="accuracy-number">
                        {row.accuracyPct != null ? `${row.accuracyPct}%` : "—"}
                      </span>
                      <span className="accuracy-label">Avg score</span>
                    </div>
                    <div className="scenario-attempts">
                      <span className="attempts-text">
                        {row.responseCount} scored response
                        {row.responseCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                  {row.accuracyPct != null ? (
                    <div className="scenario-bar">
                      <div
                        className="scenario-bar-fill"
                        style={{ width: `${row.accuracyPct}%` }}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="performance-actions">
        <ActionButton
          buttonType={"play"}
          text={"Return to module"}
          onClick={() => navigate(`/employee/simulations/${moduleId}`)}
        />
        <ActionButton
          buttonType={"go"}
          text={"All simulation modules"}
          reversed={true}
          onClick={() => navigate("/employee/simulations")}
        />
      </div>
    </div>
  );
}
