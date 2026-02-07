import './Analytics.css';
/*import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';*/
import { useEffect } from "react";
import search_icon from '../../../assets/icons/lesson-edit/grey-search.svg';
import { janeCooper } from '../../../dummy_data/user_data';
import { Tooltip } from "@radix-ui/themes";

import trending_up from '../../../assets/icons/green-trending-up-icon.svg';
import chart_icon from '../../../assets/icons/white-line-chart-icon.svg';
import prize_icon from '../../../assets/icons/white-prize-icon.svg';
import clock_icon from '../../../assets/icons/white-clock-icon.svg';
import lessons_completed from '../../../assets/icons/white-lessons-completed-icon.svg';
import star_icon from '../../../assets/icons/badges/star-icon.svg';
import bolt_icon from '../../../assets/icons/badges/bolt-icon.svg';
import map_icon from '../../../assets/icons/badges/map-icon.svg';
import right_arrow from '../../../assets/icons/white-right-arrow.svg';
import ai_icon from '../../../assets/icons/simulations/white-ai-icon.svg';

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


export default function Analytics() {
  const MAX_HOURS = 80;
  const MAX_BAR_HEIGHT = 100; 

  const getHeight = (value: number) =>
  `${(value / MAX_HOURS) * MAX_BAR_HEIGHT}px`;

  //To-Do
  // const [todos, setTodos] = useState(initialTodos);

  /*const toggleTodo = (id: number) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  };*/

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const iconByBadge: Record<BadgeIcon, string> = {
    star: star_icon,
    bolt: bolt_icon,
    map: map_icon,
  };

  return (
    <>

        <div className="search-wrapper">
            <span className="analytics-search-icon">
              <img src={search_icon} />
            </span>
            <input
              className="search-input"
              placeholder="Search by Employee Name or ID"
            />
        </div>
      <h2>Employee Name: John Doe</h2>

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
          <h3 className="card-title">Hours Spent</h3>

          <div className="hours-legend">
            <span><span className="dot study" /> Study</span>
            <span><span className="dot test" /> Online Test</span>
          </div>

          <div className="hours-chart-wrapper">
            {/* Y axis */}
            <div className="y-axis">
              <span>80 Hr</span>
              <span>60 Hr</span>
              <span>40 Hr</span>
              <span>20 Hr</span>
              <span>0 Hr</span>
            </div>
            {/* Chart */}
            <div className="hours-chart">
              {[
                { month: "Jan", study: 45, test: 30 },
                { month: "Feb", study: 20, test: 15 },
                { month: "Mar", study: 70, test: 25 },
                { month: "Apr", study: 38, test: 22 },
                { month: "May", study: 18, test: 10 },
              ].map((item, i) => (
                <div className="bar-group" key={i}>
                  <div
                    className="bar-stack"
                    data-tooltip={`🟧 ${item.study} Hr\n⬜ ${item.test} Hr`}
                  >
                    <div
                      className="bar study"
                      style={{ height: getHeight(item.study) }}
                    />
                    <div
                      className="bar test"
                      style={{ height: getHeight(item.test) }}
                    />
                  </div>

                  <span className="bar-label">{item.month}</span>
                </div>
              ))}

            </div>
          </div>
        </div>


        {/* Performance */}
        <div className="card performance-card">
          <h3 className="card-title">Performance</h3>

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
                  stroke="#f3f4f6"
                  strokeWidth="12"
                  strokeLinecap="round"
                />

                <path
                  d="M20 100 A80 80 0 0 1 140 40"
                  fill="none"
                  stroke="#ff5a1f"
                  strokeWidth="12"
                  strokeLinecap="round"
                />

                {[...Array(11)].map((_, i) => {
                  const angle = (-90 + i * 18) * (Math.PI / 180);
                  const x1 = 100 + Math.cos(angle) * 60;
                  const y1 = 100 + Math.sin(angle) * 60;
                  const x2 = 100 + Math.cos(angle) * 68;
                  const y2 = 100 + Math.sin(angle) * 68;
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                  );
                })}

                <line
                  x1="100"
                  y1="100"
                  x2="145"
                  y2="55"
                  stroke="#ff5a1f"
                  strokeWidth="3"
                />

                <circle cx="100" cy="100" r="6" fill="#ff5a1f" />
              </svg>
            </div>

            <div className="score">
              <p>Your Grade: <span>8.9/10</span></p>
              <a href="#">Click Here to See Detailed Feedback</a>
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

        <div className="card">
          <h3 className="card-title">Badges</h3>
          <div className="progress-list">
              {janeCooper.achievements.map((a) => 
                <div className="badge-item">
                  <img src={iconByBadge[a.icon as BadgeIcon]} />
                  <div className="badge-item-name">
                    <h4>{a.name}</h4>
                    <p>{a.description}</p>
                  </div>
                </div>
              )}
            </div>
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
                <p>Data-driven recommendations for coaching John Doe</p>
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

      <div className="skill-breakdown-section">
        <h2 className="section-title margin">Module Performance</h2>
        <p className="analytics-label">How John Doe is performing across modules</p>
        <div className="employee-breakdown employer-view">
          { janeCooper.completedModules.map((m) =>
            <div className="employee-module-item">
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
          )}
          { janeCooper.modulesInProgress.map((m) =>
            <div className="employee-module-item progress">
              <div className="employee-module-item-top">
                <div className="employee-module-item-left">
                  <h4>{m.moduleInfo.title}</h4>
                  <p>{m.lessons?.length} of {m.moduleInfo.lessons?.length} complete</p>
                </div>
                <div className="employee-module-item-right">
                  <div className="employee-module-item-score">
                    <h2>{m.score}%</h2>
                    <p>Current Score</p>
                  </div>
                </div>
              </div>
              <div className="employee-module-item-bottom">
                <p>{m.percent}% Progress</p>
                <div className="module-progress-bar">
                  <div className="module-progress-bar-fill" style={{ width: `${m.percent}%` }}/>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </>
  );
}
