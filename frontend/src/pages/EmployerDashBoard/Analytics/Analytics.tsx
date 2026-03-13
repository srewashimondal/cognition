import './Analytics.css';
/*import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';*/
import { useEffect, useState } from "react";
import search_icon from '../../../assets/icons/lesson-edit/grey-search.svg';
import { Tooltip } from "@radix-ui/themes";

import trending_up from '../../../assets/icons/green-trending-up-icon.svg';
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
import { collection, getDocs, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";

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

function getLastMonthLabels(count: number): string[] {
  const now = new Date();
  const labels: string[] = [];
  const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(shortMonths[d.getMonth()]);
  }
  return labels;
}

const aiInsights = [
  {
    title: "💙 Exceptional Customer Empathy",
    tag: "Leadership opportunity",
    tagColor: "yellow",
    analysis: "Jane consistently scores 96% in customer service simulations, ranking in the top 2% company-wide. AI analysis shows she excels at reading emotional cues and adapting her communication style.",
    impact: "Her empathy skills directly correlate with high customer satisfaction scores and are a model for the team.",
    recommendedActions: [
      "Feature Jane in next team training session to share techniques",
      "Record her best simulation for use as training material",
      "Consider promoting to Senior Sales Associate or Team Lead role"
    ]
  },
  {
    title: "⚡ Rapid Skill Development",
    tag: "Talent development",
    tagColor: "blue",
    analysis: "Jane has improved her conflict resolution score by 8% in just 3 weeks, demonstrating strong learning agility. She actively seeks out challenging scenarios.",
    impact: "This growth mindset makes her ideal for advanced training programs and mentorship roles.",
    recommendedActions: [
      "Offer enrollment in 'Advanced Customer Relations' program",
      "Pair with new hires as peer mentor (has shown teaching aptitude)",
      "Provide access to manager-level training modules early"
    ]
  },
  {
    title: "🔥 High Engagement & Consistency",
    tag: "Retention & recognition",
    tagColor: "green",
    analysis: "Jane completes 6-8 simulations per week, 2x the team average, with consistent timing (usually during breaks). Her last activity was 30 minutes ago.",
    impact: "High engagement indicates strong motivation and commitment to professional development.",
    recommendedActions: [
      "Acknowledge and reward this initiative in 1-on-1",
      "Ask what motivates her - insights could improve team engagement",
      "Consider gamification: Create leaderboard to inspire others"
    ]
  },
  {
    title: "🧠 Ready for Complex Scenarios",
    tag: "Challenge & growth",
    tagColor: "blue",
    analysis: "Jane has mastered standard simulations (93% avg). AI detects she may be ready for advanced, multi-step scenarios that require strategic thinking.",
    impact: "Providing harder challenges will maintain engagement and prepare her for senior roles.",
    recommendedActions: [
      "Unlock 'Expert-Level Sales Negotiations' module",
      "Create custom scenarios based on real difficult situations",
      "Challenge her to coach others struggling in areas she excels"
    ]
  },
];

/** Get ISO date string from Firestore completionDate (string or Timestamp) */
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


export default function Analytics() {
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

  useEffect(() => {
    const fetchEmployees = async () => {
      const snap = await getDocs(collection(db, "users"));
      const list: EmployeeUserType[] = [];

      snap.forEach((doc) => {
        const data = doc.data();
        if (data.role === "employee") {
          list.push({ uid: doc.id, ...data } as EmployeeUserType);
        }
      });

      setEmployees(list);
    };

    fetchEmployees();
  }, []);

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

  const maxChartHours = Math.max(1, ...hoursChartData.map((d) => d.simulation + d.standard));

  // Performance grade 0–10 from averageScore (0–100)
  const performanceGrade = selectedEmployee?.averageScore != null ? selectedEmployee.averageScore / 10 : 0;
  const gaugeRotation = -90 + (performanceGrade / 10) * 180;

  return (
  <>

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
                    <div className="analytics-change-pill green">
                    <span>
                        <img src={trending_up} />
                    </span>
                    +12% this week
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
                <div className="analytics-change-pill green">
                <span>
                    <img src={trending_up} />
                </span>
                +8% this week
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
              <span>{Math.ceil(maxChartHours)} Hr</span>
              <span>{Math.ceil(maxChartHours * 0.75)} Hr</span>
              <span>{Math.ceil(maxChartHours * 0.5)} Hr</span>
              <span>{Math.ceil(maxChartHours * 0.25)} Hr</span>
              <span>0 Hr</span>
            </div>
            <div className="hours-chart">
              {hoursChartData.map((item, i) => {
                const maxH = Math.max(maxChartHours, 1);
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

          <div className="performance-inner">
            <div className="performance-header">
              <div className="legend">
                <span className="legend-dot" />
                <span>Cognition AI’s Questions Performance</span>
              </div>

              <select className="dropdown">
                <option>Yearly</option>
                <option>Monthly</option>
                <option>Daily</option>
              </select>
            </div>

            <div className="gauge-wrapper">
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
                  stroke="url(#gaugeGrad)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${(performanceGrade / 10) * 251.2} 251.2`}
                />
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
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

            <div className="score">
              <p>Grade: <span>{performanceGrade.toFixed(1)} / 10</span></p>
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
          { aiInsights.map((a) => 
            <div className="ai-feedback-item">
              <div className="ai-feedback-item-title">
                <h4>{a.title}</h4>
                <div className={`ai-feedback-item-tag-pill ${a.tagColor}`}>{a.tag}</div>
              </div>
              <div className="ai-feedback-item-info">
                <p className="bold">📊 AI Analysis:</p>
                <p>{a.analysis}</p>
              </div>
              <div className="ai-feedback-item-info">
                <p className="bold">💡 Impact:</p>
                <p>{a.impact}</p>
              </div>
              <div className="improved-msg ai">
                  <div className="blue-thing ai employer-view" />
                  <div className="improved-msg-content ai employer-view">
                      <p className="title">Recommended Actions:</p>
                      <ul>
                        {a.recommendedActions.map(r => <li>{r}</li>)}
                      </ul>
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="skill-breakdown-section" id="module-performance">
        <h2 className="section-title margin">Module Performance</h2>
        <p className="analytics-label">How {selectedEmployee.fullName} is performing across modules</p>
        <div className="employee-breakdown employer-view">
          { selectedEmployee?.completedModules?.map((m) => (
            <div className="employee-module-item" key={m.moduleInfo.id}>
              <div className="employee-module-item-left">
                <h4>{m.moduleInfo.title}</h4>
                <p>{m.lessons?.length} of {m.moduleInfo.lessons?.length} complete</p>
              </div>
              <div className="employee-module-item-right">
                <div className="employee-module-item-score">
                  <h2>{m.score}%</h2>
                  <p>Module Score</p>
                </div>
                <Tooltip content="See details">
                  <div className="arrow-cta">
                    <img src={right_arrow} />
                  </div>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </div>

     </>
    )}
  </>
  );
}