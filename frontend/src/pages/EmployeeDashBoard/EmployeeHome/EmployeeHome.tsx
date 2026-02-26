import './EmployeeHome.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleCard from '../../../cards/ModuleCard/ModuleCard';
import WorkspaceHero from '../../../components/WorkspaceHero/WorkspaceHero';
import type { EmployeeUserType } from '../../../types/User/UserType';
import type { EmployerUserType } from '../../../types/User/UserType';
import type { LearningStreak } from '../../../types/User/UserType';
import type { WorkspaceType } from '../../../types/User/WorkspaceType';

import trending_up from '../../../assets/icons/green-trending-up-icon.svg';
import chart_icon from '../../../assets/icons/white-line-chart-icon.svg';
import prize_icon from '../../../assets/icons/badges/white-medal-icon.svg';
import clock_icon from '../../../assets/icons/white-clock-icon.svg';
import lessons_completed from '../../../assets/icons/white-lessons-completed-icon.svg';
import ai_icon from '../../../assets/icons/simulations/white-ai-icon.svg';

const aiInsights = [
    {
        title: "💚 Strong Empathy Skills",
        description: "You consistently demonstrate excellent empathy in customer interactions, scoring 95% in tone and emotional intelligence.",
        suggestion: "Keep it up! Your empathy is a standout skill."
    },
    {
        title: "📚 Product Knowledge Gap",
        description: "AI detected you hesitate when discussing technical specifications. You scored 78% on product detail questions.",
        suggestion: "Review the 'Electronics Features Guide' to boost confidence."
    },
    {
        title: "⚡ Faster Response Times",
        description: "Your average response time is 8 seconds. Top performers respond in 5-6 seconds while maintaining quality.",
        suggestion: "Practice the 'Quick Assessment Framework' to speed up without sacrificing accuracy."
    },
    {
        title: "🎯 Conflict De-escalation Master",
        description: "You've successfully de-escalated 12 difficult customer scenarios this week with a 92% satisfaction rate.",
        suggestion: "Amazing work! You're in the top 10% for this skill."
    },
];

export default function EmployeeHome({ user, workspace }: { user: EmployeeUserType | EmployerUserType,  workspace: WorkspaceType}) {
    const navigate = useNavigate();
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

    const isEmployee = user.role === "employee";
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
            
            <WorkspaceHero role={"employee"} workspace={workspace} />

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
                            <h3 className="analytics-value">87%</h3>
                            <span className="analytics-change">Average score</span>
                            <p className="analytics-label">across all lessons</p>
                        </div>
                        <div className="analytics-icon orange">
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
                        <h3 className="analytics-value">7</h3>
                        <span className="analytics-change">Lessons completed this week</span>
                        <p className="analytics-label">of 22 total</p>
                    </div>
                    <div className="analytics-icon orange">
                        <img src={lessons_completed} />
                    </div>
                    </div>

                    <div className="analytics-card">
                        <div className="analytics-left">
                            <h3 className="analytics-value">3</h3>
                            <span className="analytics-change">Badges earned</span>
                            <p className="analytics-label">Keep it up!</p>
                        </div>
                        <div className="analytics-icon orange">
                            <img src={prize_icon} />
                        </div>
                    </div>

                    <div className="analytics-card">
                        <div className="analytics-left">
                            <h3 className="analytics-value">6.5</h3>
                            <span className="analytics-change">hours invested</span>
                            <p className="analytics-label">time across lessons</p>
                        </div>
                        <div className="analytics-icon orange">
                            <img src={clock_icon} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="section">
                <div className="section-header">
                    <h2>Upcoming Deadlines</h2>
                </div>
                <div className="deadlines-list">
                    <div className="deadline-item urgent" onClick={() => navigate("/employee/standard-modules/1/3")}>
                        <div className="deadline-date">
                            <div className="date-box">
                                <span className="date-day">24</span>
                                <span className="date-month">Jan</span>
                            </div>
                        </div>
                        <div className="deadline-info">
                            <h4>Standards of Conduct Knowledge Check</h4>
                            <p>Due in 3 days</p>
                        </div>
                        <div className="deadline-badge urgent-badge">Urgent</div>
                    </div>
                    <div className="deadline-item">
                        <div className="deadline-date">
                            <div className="date-box">
                                <span className="date-day">28</span>
                                <span className="date-month">Jan</span>
                            </div>
                        </div>
                        <div className="deadline-info">
                            <h4>Figma Design Project Submission</h4>
                            <p>Due in 7 days</p>
                        </div>
                        <div className="deadline-badge">Upcoming</div>
                    </div>
                    <div className="deadline-item">
                        <div className="deadline-date">
                            <div className="date-box">
                                <span className="date-day">02</span>
                                <span className="date-month">Feb</span>
                            </div>
                        </div>
                        <div className="deadline-info">
                            <h4>Time Management Workshop Attendance</h4>
                            <p>Due in 12 days</p>
                        </div>
                        <div className="deadline-badge">Upcoming</div>
                    </div>
                </div>
            </div>

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
                            <span className="goal-current">12</span>
                            <span className="goal-divider">/</span>
                            <span className="goal-target">20 hours</span>
                        </div>
                        <div className="goal-progress-bar">
                            <div className="goal-progress-fill" style={{width: '60%'}}></div>
                        </div>
                        <p className="goal-text">60% complete - You're doing great!</p>
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
                        <img src={ai_icon} />
                    </div>
                    <div className="ai-powered-insights-title">
                        <h3>AI-Powered Insights</h3>
                        <p>Personalized feedback to help you improve</p>
                    </div>
                </div>
                <div className="ai-feedback-grid">
                    { aiInsights.map((a) =>
                        <div className="ai-feedback-item">
                            <h4>{a.title}</h4>
                            <p>{a.description}</p>
                            <div className="improved-msg ai">
                                <div className="blue-thing ai" />
                                <div className="improved-msg-content ai">
                                    {a.suggestion}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}