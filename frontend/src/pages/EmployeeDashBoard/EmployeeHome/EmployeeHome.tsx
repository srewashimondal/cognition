import './EmployeeHome.css';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import ModuleCard from '../../../cards/ModuleCard/ModuleCard';
import WorkspaceHero from '../../../components/WorkspaceHero/WorkspaceHero';
import type { EmployeeUserType } from '../../../types/User/UserType';
import type { EmployerUserType } from '../../../types/User/UserType';
import type { LearningStreak } from '../../../types/User/UserType';
import type { WorkspaceType } from '../../../types/User/WorkspaceType';

import trending_up from '../../../assets/icons/green-trending-up-icon.svg';
import chart_icon from '../../../assets/icons/analytics/chart-icon.svg';
import prize_icon from '../../../assets/icons/analytics/medal-icon.svg';
import clock_icon from '../../../assets/icons/analytics/clock-icon.svg';
import lessons_completed from '../../../assets/icons/analytics/lesson-completed-icon.svg';
import ai_icon from '../../../assets/icons/simulations/white-ai-icon.svg';

export type InsightItem = {
    title: string;
    description: string;
    suggestion: string;
};

const URGENT_WITHIN_DAYS = 5;
const MAX_UPCOMING_DEADLINES = 10;

type UpcomingDeadlineRow = {
    id: string;
    moduleKind: "standard" | "simulation";
    moduleTitle: string;
    lessonTitle: string;
    due: Date;
    dayNum: string;
    monthShort: string;
    relativeLabel: string;
    urgent: boolean;
    href: string;
};

function parseDueForDeadline(raw: string | null | undefined): Date | null {
    if (raw == null || raw === "") return null;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
}

function startOfLocalDayTime(d: Date): number {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function buildRelativeDue(due: Date, now: Date): { relativeLabel: string; urgent: boolean } {
    const dayDiff = Math.round((startOfLocalDayTime(due) - startOfLocalDayTime(now)) / 86_400_000);
    if (dayDiff < 0) {
        const n = Math.abs(dayDiff);
        return { relativeLabel: `Overdue by ${n} day${n === 1 ? "" : "s"}`, urgent: true };
    }
    if (dayDiff === 0) {
        return { relativeLabel: "Due today", urgent: true };
    }
    if (dayDiff < URGENT_WITHIN_DAYS) {
        return { relativeLabel: `Due in ${dayDiff} day${dayDiff === 1 ? "" : "s"}`, urgent: true };
    }
    return { relativeLabel: `Due in ${dayDiff} day${dayDiff === 1 ? "" : "s"}`, urgent: false };
}

async function loadStandardDeadlinesForAttempt(
    moduleAttemptId: string,
    now: Date
): Promise<UpcomingDeadlineRow[]> {
    const moduleAttemptRef = doc(db, "standardModuleAttempts", moduleAttemptId);
    const modSnap = await getDoc(moduleAttemptRef);
    if (!modSnap.exists()) return [];
    if (modSnap.data().status === "completed") return [];

    const moduleInfoRef = modSnap.data().moduleInfo;
    let moduleTitle = "Standard module";
    if (moduleInfoRef) {
        const moduleSnap = await getDoc(moduleInfoRef);
        if (moduleSnap.exists()) {
            const md = moduleSnap.data() as { title?: string };
            if (typeof md.title === "string" && md.title.trim()) moduleTitle = md.title.trim();
        }
    }

    const lessonSnap = await getDocs(
        query(
            collection(db, "standardLessonAttempts"),
            where("moduleRef", "==", moduleAttemptRef)
        )
    );
    const out: UpcomingDeadlineRow[] = [];
    for (const d of lessonSnap.docs) {
        const attemptData = d.data();
        if (attemptData.status === "completed") continue;
        const lessonInfoRef = attemptData.lessonInfo;
        if (!lessonInfoRef) continue;
        const lessonOriginalSnap = await getDoc(lessonInfoRef);
        if (!lessonOriginalSnap.exists()) continue;
        const raw = lessonOriginalSnap.data() as { title?: string; dueDate?: string | null };
        const due = parseDueForDeadline(raw.dueDate);
        if (!due) continue;
        const lessonTitle = typeof raw.title === "string" && raw.title.trim() ? raw.title : "Lesson";
        const { relativeLabel, urgent } = buildRelativeDue(due, now);
        const dayNum = String(due.getDate()).padStart(2, "0");
        const monthShort = due
            .toLocaleDateString("en-US", { month: "short" })
            .replace(".", "");
        out.push({
            id: `std-${moduleAttemptId}-${d.id}`,
            moduleKind: "standard",
            moduleTitle,
            lessonTitle,
            due,
            dayNum,
            monthShort,
            relativeLabel,
            urgent,
            href: `/employee/standard-modules/${moduleAttemptId}/${d.id}`,
        });
    }
    return out;
}

async function loadSimulationDeadlinesForAttempt(
    moduleAttemptId: string,
    now: Date
): Promise<UpcomingDeadlineRow[]> {
    const moduleAttemptRef = doc(db, "simulationModuleAttempts", moduleAttemptId);
    const modSnap = await getDoc(moduleAttemptRef);
    if (!modSnap.exists()) return [];
    if (modSnap.data().status === "completed") return [];

    const moduleInfoRef = modSnap.data().moduleInfo;
    let moduleTitle = "Simulation module";
    if (moduleInfoRef) {
        const moduleSnap = await getDoc(moduleInfoRef);
        if (moduleSnap.exists()) {
            const md = moduleSnap.data() as { title?: string };
            if (typeof md.title === "string" && md.title.trim()) moduleTitle = md.title.trim();
        }
    }

    const lessonSnap = await getDocs(
        query(
            collection(db, "simulationLessonAttempts"),
            where("moduleRef", "==", moduleAttemptRef)
        )
    );
    const out: UpcomingDeadlineRow[] = [];
    for (const d of lessonSnap.docs) {
        const attemptData = d.data();
        if (attemptData.status === "completed") continue;
        const lessonInfoRef = attemptData.lessonInfo;
        if (!lessonInfoRef) continue;
        const lessonOriginalSnap = await getDoc(lessonInfoRef);
        if (!lessonOriginalSnap.exists()) continue;
        const raw = lessonOriginalSnap.data() as { title?: string; dueDate: string | null };
        const due = parseDueForDeadline(raw.dueDate);
        if (!due) continue;
        const lessonTitle = typeof raw.title === "string" && raw.title.trim() ? raw.title : "Lesson";
        const { relativeLabel, urgent } = buildRelativeDue(due, now);
        const dayNum = String(due.getDate()).padStart(2, "0");
        const monthShort = due
            .toLocaleDateString("en-US", { month: "short" })
            .replace(".", "");
        out.push({
            id: `sim-${moduleAttemptId}-${d.id}`,
            moduleKind: "simulation",
            moduleTitle,
            lessonTitle,
            due,
            dayNum,
            monthShort,
            relativeLabel,
            urgent,
            href: `/employee/simulations/${moduleAttemptId}/${d.id}/1`,
        });
    }
    return out;
}

export default function EmployeeHome({ user, workspace }: { user: EmployeeUserType | EmployerUserType,  workspace: WorkspaceType}) {
    const navigate = useNavigate();
    const [insights, setInsights] = useState<InsightItem[]>([]);
    const [insightsLoading, setInsightsLoading] = useState(true);
    const [workspaceLearnerCount, setWorkspaceLearnerCount] = useState<number | null>(null);

    useEffect(() => {
        if (!workspace?.id) {
            setWorkspaceLearnerCount(null);
            return;
        }
        setWorkspaceLearnerCount(null);
        const workspaceRef = doc(db, "workspaces", workspace.id);
        const q = query(
            collection(db, "users"),
            where("workspaceID", "==", workspaceRef),
            where("role", "==", "employee")
        );
        const unsub = onSnapshot(q, (snapshot) => {
            setWorkspaceLearnerCount(snapshot.size);
        });
        return () => unsub();
    }, [workspace?.id]);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

    useEffect(() => {
        if (!user?.uid || !workspace?.id) {
            setInsightsLoading(false);
            return;
        }
        let cancelled = false;
        setInsightsLoading(true);
        fetch("http://127.0.0.1:8000/ai/employee-insights", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.uid, workspace_id: workspace.id }),
        })
            .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load insights"))))
            .then((data) => {
                if (!cancelled && Array.isArray(data?.insights)) setInsights(data.insights);
            })
            .catch(() => {
                if (!cancelled) setInsights([{
                    title: "🚀 Get started",
                    description: "Complete simulation modules to see personalized feedback and insights here.",
                    suggestion: "Go to Simulations and complete at least one scenario to unlock your first insight."
                }]);
            })
            .finally(() => {
                if (!cancelled) setInsightsLoading(false);
            });
        return () => { cancelled = true; };
    }, [user?.uid, workspace?.id]);

    const isEmployee = user.role === "employee";
    const employeeUser = isEmployee ? (user as EmployeeUserType) : null;

    const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadlineRow[]>([]);
    const [deadlinesLoading, setDeadlinesLoading] = useState(false);
    const deadlineGenRef = useRef(0);
    const stdModuleAttemptIdsRef = useRef<string[]>([]);
    const simModuleAttemptIdsRef = useRef<string[]>([]);

    useEffect(() => {
        if (!employeeUser?.uid || !employeeUser.workspaceID) {
            setUpcomingDeadlines([]);
            setDeadlinesLoading(false);
            return;
        }

        setDeadlinesLoading(true);
        const userRef = doc(db, "users", employeeUser.uid);
        const wRef = employeeUser.workspaceID;

        const simQ = query(
            collection(db, "simulationModuleAttempts"),
            where("user", "==", userRef),
            where("workspaceRef", "==", wRef)
        );
        const stdQ = query(
            collection(db, "standardModuleAttempts"),
            where("user", "==", userRef),
            where("workspaceRef", "==", wRef)
        );

        const runMerge = () => {
            const myGen = ++deadlineGenRef.current;
            const stdIds = stdModuleAttemptIdsRef.current;
            const simIds = simModuleAttemptIdsRef.current;
            void (async () => {
                const now = new Date();
                try {
                    const parts = await Promise.all([
                        ...stdIds.map((id) => loadStandardDeadlinesForAttempt(id, now)),
                        ...simIds.map((id) => loadSimulationDeadlinesForAttempt(id, now)),
                    ]);
                    if (myGen !== deadlineGenRef.current) return;
                    const merged = parts
                        .flat()
                        .sort((a, b) => a.due.getTime() - b.due.getTime())
                        .slice(0, MAX_UPCOMING_DEADLINES);
                    setUpcomingDeadlines(merged);
                } catch (e) {
                    console.error("Upcoming deadlines:", e);
                    if (myGen === deadlineGenRef.current) setUpcomingDeadlines([]);
                } finally {
                    if (myGen === deadlineGenRef.current) setDeadlinesLoading(false);
                }
            })();
        };

        const unsubSim = onSnapshot(simQ, (snap) => {
            simModuleAttemptIdsRef.current = snap.docs.map((d) => d.id);
            runMerge();
        });
        const unsubStd = onSnapshot(stdQ, (snap) => {
            stdModuleAttemptIdsRef.current = snap.docs.map((d) => d.id);
            runMerge();
        });

        return () => {
            deadlineGenRef.current += 1;
            unsubSim();
            unsubStd();
        };
    }, [employeeUser?.uid, employeeUser?.workspaceID]);

    const streak: LearningStreak | undefined =
        isEmployee && (user as EmployeeUserType).learningStreak
            ? (user as EmployeeUserType).learningStreak
            : undefined;

    const currentStreak = streak?.current ?? 0;
    const longestStreak = streak?.longest ?? 0;
    const streakLabel =
        currentStreak > 0 ? `${currentStreak} Day${currentStreak === 1 ? "" : "s"}` : "0 Days";

    const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
    const activeCount = Math.min(currentStreak, daysOfWeek.length);

    const totalHours = isEmployee? (user as EmployeeUserType).totalHours ?? 0: 0;

    const monthlyGoal = 20;
    const progressPercent = Math.min(Math.round((totalHours / monthlyGoal) * 100),100);

    return (
        <div className="employee-home">
            {/* Welcome Banner */}
           {/* <div className="welcome-banner">
                <div className="welcome-content">
                    <h1>Welcome back, Alex! </h1>
                    <p>Continue your learning journey and achieve your goals</p>
                </div>
                <div className="welcome-icon">
                    <div className="icon-placeholder"></div>
                </div>
            </div> */}
            
            <WorkspaceHero role={"employee"} workspace={workspace} totalLearners={workspaceLearnerCount} />

            {/*
            
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-icon courses-icon">📚</div>
                        <div className="stat-info">
                            <h3>10</h3>
                            <p>Total Courses</p>
                            <span className="stat-change positive">+2 this month</span>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-icon workshop-icon">🎓</div>
                        <div className="stat-info">
                            <h3>4</h3>
                            <p>Workshops</p>
                            <span className="stat-change">Upcoming</span>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-icon quiz-icon">📊</div>
                        <div className="stat-info">
                            <h3>8/10</h3>
                            <p>Average Quiz Score</p>
                            <span className="stat-change positive">+5% improvement</span>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-icon cert-icon">🏆</div>
                        <div className="stat-info">
                            <h3>3</h3>
                            <p>Total Certificates</p>
                            <span className="stat-change">Earned</span>
                        </div>
                    </div>
                </div>
            </div> 
            */}

            <div className="section">
                <div className="section-header">
                    <h2>Performance Overview</h2>
                </div>

                <div className="analytics-grid">
                    <div className="analytics-card">
                        <div className="analytics-left">
                            <div className="analytics-change-pill green">
                            <span>
                                <img src={trending_up} />
                            </span>
                            +12% this week
                            </div>
                            <h3 className="analytics-value"> {isEmployee ? (user as EmployeeUserType).averageScore ?? 0 : 0}%</h3>
                            <span className="analytics-change">Average score</span>
                            <p className="analytics-label">across all lessons</p>
                        </div>
                        <div className="analytics-icon blue">
                            <img src={chart_icon} />
                        </div>
                    </div>
                    <div className="analytics-card">
                    <div className="analytics-left">
                        <div className="analytics-change-pill green">
                        <span>
                            <img src={trending_up} />
                        </span>
                        +8% this week
                        </div>
                        <h3 className="analytics-value">
                        {isEmployee
                            ? (user as EmployeeUserType).completedModules?.length ?? 0
                            : 0}
                        </h3>
                        <span className="analytics-change">Lessons completed this week</span>
                        <p className="analytics-label">of 22 total</p>
                    </div>
                    <div className="analytics-icon teal">
                        <img src={lessons_completed} />
                    </div>
                    </div>

                    <div className="analytics-card">
                        <div className="analytics-left">
                            <h3 className="analytics-value">
                            {isEmployee
                                ? (user as EmployeeUserType).achievements?.length ?? 0
                                : 0}
                            </h3>
                            <span className="analytics-change">Badges earned</span>
                            <p className="analytics-label">Keep it up!</p>
                        </div>
                        <div className="analytics-icon amber">
                            <img src={prize_icon} />
                        </div>
                    </div>

                    <div className="analytics-card">
                        <div className="analytics-left">
                            <h3 className="analytics-value">
                            {isEmployee
                                ? (user as EmployeeUserType).totalHours ?? 0
                                : 0}
                            </h3>
                            <span className="analytics-change">hours invested</span>
                            <p className="analytics-label">time across lessons</p>
                        </div>
                        <div className="analytics-icon purple">
                            <img src={clock_icon} />
                        </div>
                    </div>
                </div>
            </div>

            {isEmployee && (
            <div className="section">
                <div className="section-header">
                    <h2>Upcoming Deadlines</h2>
                </div>
                {deadlinesLoading && (
                    <p className="deadlines-empty">Loading deadlines…</p>
                )}
                {!deadlinesLoading && upcomingDeadlines.length === 0 && (
                    <p className="deadlines-empty">No upcoming deadlines. Lessons with due dates in your in-progress modules will show here.</p>
                )}
                {!deadlinesLoading && upcomingDeadlines.length > 0 && (
                <div className="deadlines-list">
                    {upcomingDeadlines.map((d) => (
                    <div
                        key={d.id}
                        className={`deadline-item${d.urgent ? " urgent" : ""}`}
                        onClick={() => navigate(d.href)}
                    >
                        <div className="deadline-date">
                            <div className="date-box">
                                <span className="date-day">{d.dayNum}</span>
                                <span className="date-month">{d.monthShort}</span>
                            </div>
                        </div>
                        <div className="deadline-info">
                            <p className="deadline-module-context">
                                <span className="deadline-module-kind">
                                    {d.moduleKind === "simulation" ? "Simulation module" : "Standard module"}
                                </span>
                                <span className="deadline-module-sep"> · </span>
                                <span className="deadline-module-name">{d.moduleTitle}</span>
                            </p>
                            <h4>{d.lessonTitle}</h4>
                            <p>{d.relativeLabel}</p>
                        </div>
                        <div className={`deadline-badge${d.urgent ? " urgent-badge" : ""}`}>
                            {d.urgent ? "Urgent" : "Upcoming"}
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>
            )}

            <div className="section">
                <div className="section-header">
                    <h2>Recent Enrolled Course (2)</h2>
                    <button className="view-all-btn">View All</button>
                </div>
                <div className="courses-grid">
                    {user.role === "employee" &&
                        <>
                            {user.modulesInProgress.map((m) => <ModuleCard moduleInfo={m.moduleInfo} role={"employee"} type={m.moduleInfo.kind} status={m.status} percent={m.percent} style={true} />)}
                        </>
                    }
                    {/*<div className="course-card">
                        <div className="course-thumbnail">
                            <div className="course-preview figma-preview">
                                <div className="preview-content">
                                    <span className="preview-text">Nothing great is made alone.</span>
                                </div>
                            </div>
                        </div>
                        <div className="course-info">
                            <p className="course-author">A Course by Rafasuddin Duana</p>
                            <h3 className="course-title">Figma for Beginners: Fundamentals of Figma App</h3>
                            <div className="course-meta">
                                <span className="progress-text">23%</span>
                                <span className="student-count">🧑‍🎓 147 Students</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{width: '23%'}}></div>
                            </div>
                        </div>
                    </div>

                    <div className="course-card">
                        <div className="course-thumbnail">
                            <div className="course-preview webflow-preview">
                                <div className="preview-bar"></div>
                                <div className="preview-bar short"></div>
                            </div>
                        </div>
                        <div className="course-info">
                            <p className="course-author">A Course by Rafasuddin Duana</p>
                            <h3 className="course-title">Complete Web Design: from Figma to Webflow</h3>
                            <div className="course-meta">
                                <span className="progress-text">50%</span>
                                <span className="student-count">🧑‍🎓 145,075 Students</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{width: '50%'}}></div>
                            </div>
                        </div>
                    </div>

                    <div className="course-card">
                        <div className="course-thumbnail">
                            <div className="course-preview class-preview">
                                <div className="preview-bar teal"></div>
                            </div>
                        </div>
                        <div className="course-info">
                            <p className="course-author">A Course by Rafasuddin Duana</p>
                            <h3 className="course-title">Figma 2023: The Absolute Beginner to Pro Class in und...</h3>
                            <div className="course-meta">
                                <span className="progress-text">69%</span>
                                <span className="student-count">🧑‍🎓 241,133 Students</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{width: '69%'}}></div>
                            </div>
                        </div>
                    </div>

                    <div className="course-card">
                        <div className="course-thumbnail">
                            <div className="course-preview notion-preview">
                                <div className="notion-grid">
                                    <div className="notion-item"></div>
                                    <div className="notion-item"></div>
                                    <div className="notion-item"></div>
                                    <div className="notion-item"></div>
                                </div>
                                <span className="notion-text">Personal Productivity</span>
                            </div>
                        </div>
                        <div className="course-info">
                            <p className="course-author">A Course by Rafasuddin Duana</p>
                            <h3 className="course-title">Mastering Managing Project with Notion</h3>
                            <div className="course-meta">
                                <span className="progress-text">90%</span>
                                <span className="student-count">🧑‍🎓 111 Students</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{width: '90%'}}></div>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>

            <div className="two-column-section">
                <div className="streak-card">
                    <div className="streak-header">
                        <h3>Learning Streak</h3>
                    </div>
                    <div className="streak-content">
                        <div className="streak-number">{streakLabel}</div>
                        <p className="streak-text">
                            {currentStreak > 0
                                ? `Keep it up! Longest streak: ${longestStreak} day${longestStreak === 1 ? "" : "s"}.`
                                : "Start learning today to begin your streak."}
                        </p>
                        <div className="streak-days">
                            {daysOfWeek.map((d, idx) => (
                                <div
                                    key={`${d}-${idx}`}
                                    className={`day-circle ${idx < activeCount ? "active" : ""}`}
                                >
                                    {d}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                
                <div className="goal-card">
                    <div className="goal-header">
                        <h3>Monthly Learning Goal</h3>
                    </div>
                    <div className="goal-content">
                        <div className="goal-stats">
                            <span className="goal-current">{totalHours}</span>
                            <span className="goal-divider">/</span>
                            <span className="goal-target">{monthlyGoal} hours</span>
                        </div>
                        <div className="goal-progress-bar">
                            <div className="goal-progress-fill" style={{width: `${progressPercent}%`}}></div>
                        </div>
                        <p className="goal-text">
                            {progressPercent}% complete - {
                                progressPercent >= 100
                                ? "Goal achieved! 🎉"
                                : "You're doing great!"
                            }
                        </p>
                    </div>
                </div>
            </div>

            
            {/*<div className="section">
                <div className="section-header">
                    <h2>🏅 Skills & Badges Earned</h2>
                    <button className="view-all-btn">View All</button>
                </div>
                <div className="badges-grid">
                    <div className="badge-card">
                        <div className="badge-icon gold">🏆</div>
                        <h4>Design Master</h4>
                        <p>Completed 5 design courses</p>
                        <span className="badge-date">Earned Dec 2024</span>
                    </div>
                    <div className="badge-card">
                        <div className="badge-icon silver">⭐</div>
                        <h4>Quick Learner</h4>
                        <p>Finished 3 courses in 1 month</p>
                        <span className="badge-date">Earned Jan 2025</span>
                    </div>
                    <div className="badge-card">
                        <div className="badge-icon bronze">🎯</div>
                        <h4>Team Player</h4>
                        <p>Participated in 10 workshops</p>
                        <span className="badge-date">Earned Nov 2024</span>
                    </div>
                    <div className="badge-card locked">
                        <div className="badge-icon locked-icon">🔒</div>
                        <h4>Expert Level</h4>
                        <p>Complete 10 courses to unlock</p>
                        <span className="badge-progress">8/10 courses</span>
                    </div>
                </div>
            </div>

    
            <div className="section">
                <div className="section-header">
                    <h2>💡 Recommended For You</h2>
                    <button className="view-all-btn">View All</button>
                </div>
                <div className="recommended-grid">
                    <div className="recommended-card">
                        <div className="recommended-thumbnail">
                            <div className="recommended-preview rec-1">
                                <span className="rec-text">Advanced</span>
                            </div>
                        </div>
                        <div className="recommended-info">
                            <span className="recommended-tag">Based on your progress</span>
                            <h4>Advanced Figma Techniques</h4>
                            <p>Take your design skills to the next level</p>
                            <button className="enroll-btn">Enroll Now</button>
                        </div>
                    </div>
                    <div className="recommended-card">
                        <div className="recommended-thumbnail">
                            <div className="recommended-preview rec-2">
                                <span className="rec-text">Leadership</span>
                            </div>
                        </div>
                        <div className="recommended-info">
                            <span className="recommended-tag">Popular in your department</span>
                            <h4>Effective Team Communication</h4>
                            <p>Master the art of workplace collaboration</p>
                            <button className="enroll-btn">Enroll Now</button>
                        </div>
                    </div>
                    <div className="recommended-card">
                        <div className="recommended-thumbnail">
                            <div className="recommended-preview rec-3">
                                <span className="rec-text">Productivity</span>
                            </div>
                        </div>
                        <div className="recommended-info">
                            <span className="recommended-tag">Complete your collection</span>
                            <h4>Project Management Essentials</h4>
                            <p>Learn to manage projects like a pro</p>
                            <button className="enroll-btn">Enroll Now</button>
                        </div>
                    </div>
                </div>
            </div>

         
            <div className="section">
                <div className="section-header">
                    <h2>Recent Enrolled Webinar (8)</h2>
                    <button className="view-all-btn">View All</button>
                </div>
                <div className="webinar-grid">
                    <div className="webinar-card">
                        <div className="webinar-thumbnail">
                            <div className="webinar-preview">
                                <span className="webinar-tag">Time Management</span>
                            </div>
                        </div>
                        <div className="webinar-info">
                            <p className="webinar-author">By John Doe</p>
                        </div>
                    </div>

                    <div className="webinar-card">
                        <div className="webinar-thumbnail">
                            <div className="webinar-preview">
                                <span className="webinar-tag">Navigating Workplace</span>
                            </div>
                        </div>
                        <div className="webinar-info">
                            <p className="webinar-author">By John Doe</p>
                        </div>
                    </div>

                    <div className="webinar-card">
                        <div className="webinar-thumbnail">
                            <div className="webinar-preview upcoming">
                                <span className="webinar-tag">Customer Service</span>
                            </div>
                        </div>
                        <div className="webinar-info">
                            <p className="webinar-author">By John Doe</p>
                        </div>
                    </div>
                </div>
            </div>
            */}

            <div className="ai-powered-insights">
                <div className="ai-powered-insights-top">
                    <div className="ai-icon-wrapper">
                        <img src={ai_icon} alt="" />
                    </div>
                    <div className="ai-powered-insights-title">
                        <h3>AI-Powered Insights</h3>
                        <p>Personalized feedback to help you improve</p>
                    </div>
                </div>
                {insightsLoading ? (
                    <div className="ai-feedback-grid ai-insights-loading">
                        <p className="insights-loading-text">Loading your insights…</p>
                    </div>
                ) : (
                    <div className="ai-feedback-grid">
                        {insights.map((a, i) => (
                            <div key={i} className="ai-feedback-item">
                                <h4>{a.title}</h4>
                                <p>{a.description}</p>
                                <div className="improved-msg ai">
                                    <div className="blue-thing ai" />
                                    <div className="improved-msg-content ai">
                                        {a.suggestion}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}