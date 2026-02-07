import "./EmployerHome.css";
import { useState, useEffect } from "react";
import { janeCooper } from "../../../dummy_data/user_data";
import ProfilePage from "../ProfilePage/ProfilePage";

import users_icon from '../../../assets/icons/white-users-icon.svg';
import trending_up from '../../../assets/icons/green-trending-up-icon.svg';
import chart_icon from '../../../assets/icons/white-line-chart-icon.svg';
import trending_down from '../../../assets/icons/red-trending-down-icon.svg';
import prize_icon from '../../../assets/icons/white-prize-icon.svg';
import clock_icon from '../../../assets/icons/white-clock-icon.svg';
import leaderboard_icon from '../../../assets/icons/orange-leaderboard-icon.svg';
import warning_icon from '../../../assets/icons/orange-warning-icon.svg';

const employees = Array.from({ length: 9 });

const modulePerformance = [
  {
    title: "Store Orientation and Navigation",
    avgScore: 78,
    completion: 82
  },
  {
    title: "Product Knowledge & Inventory",
    avgScore: 74,
    completion: 76,
    totalEnrolled: 156
  },
  {
    title: "Customer Interaction & Communication",
    avgScore: 81,
    completion: 85,
    totalEnrolled: 139
  },
  {
    title: "Checkout, POS & Transactions",
    avgScore: 72,
    completion: 69,
    totalEnrolled: 162
  },
  {
    title: "Safety, Compliance & Store Policy",
    avgScore: 88,
    completion: 91,
    totalEnrolled: 141
  },
  {
    title: "Multitasking & Real-World Pressure",
    avgScore: 70,
    completion: 64,
    totalEnrolled: 110
  }
];

const employeeRankings = [
  {
    ranking: 1,
    name: "Sarah Johnson",
    department: "Sales Floor",
    score: 95,
    totalCompletedLessons: 24
  },
  {
    ranking: 2,
    name: "Marcus Chen",
    department: "Electronics",
    score: 93,
    totalCompletedLessons: 22
  },
  {
    ranking: 3,
    name: "Emily Rodriguez",
    department: "Customer Service",
    score: 92,
    totalCompletedLessons: 26
  },
  {
    ranking: 4,
    name: "James Wilson",
    department: "Sales Floor",
    score: 91,
    totalCompletedLessons: 20
  },
  {
    ranking: 5,
    name: "Lisa Park",
    department: "Apparel",
    score: 91,
    totalCompletedLessons: 23
  },
];

const needAttention = [
  {
    name: "Alex Turner",
    department: "Electronics",
    score: 62,
    totalCompletedLessons: 8
  },
  {
    name: "Jordan Lee",
    department: "Customer Service",
    score: 65,
    totalCompletedLessons: 6
  },
  {
    name: "Sam Patel",
    department: "Sales Floor",
    score: 68,
    totalCompletedLessons: 9
  }
];

export default function EmployerHome({ viewer }: { viewer: Record<string, string> }) {
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [chosenProfile, setChosenProfile] = useState<number | null>(null); // change to a different key later
  const [showAll, setShowAll] = useState(false);

  const visibleEmployees = employees.filter(() => {
  if (!search) return true;

  const term = search.toLowerCase();
    return (
      "jane cooper".includes(term) ||
      "121948ash".includes(term)
    );
  });

  useEffect(() => {
    if (profileOpen) return;

    if (!profileOpen && chosenProfile !== null) {
      setChosenProfile(null);
    }

  }, [profileOpen]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
  
    <div className="employer-dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-left">
          <h3 className="welcome-title">
            Welcome back, Harsh! <span className="wave"></span>
          </h3>
          <p className="welcome-subtitle">
            Shape the future of learning with innovative courses
          </p>

          <div className="welcome-stats">
            <div className="stat">
              <h4>7</h4>
              <span>Active Courses</span>
            </div>
            <div className="stat">
              <h4>247</h4>
              <span>Total Learners</span>
            </div>
            <div className="stat">
              <h4>94%</h4>
              <span>Satisfaction Rate</span>
            </div>
          </div>
        </div>

        <div className="welcome-right">
          <div className="icon-stack">
            <div className="icon primary" />
            <div className="icon secondary" />
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="analytics-header">
        <h3 className="section-title">Acme Retail Analytics Overview</h3>
      </div>
  
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-left">
            <div className="analytics-change-pill green">
              <span>
                <img src={trending_up} />
              </span>
              +8% this week
            </div>
            <h3 className="analytics-value">189</h3>
            <span className="analytics-change">Active this week</span>
            <p className="analytics-label">of 247 total</p>
          </div>
          <div className="analytics-icon orange">
            <img src={users_icon} />
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-left">
            <div className="analytics-change-pill green">
              <span>
                <img src={trending_up} />
              </span>
              +12% this week
            </div>
            <h3 className="analytics-value">84%</h3>
            <span className="analytics-change">Average simulation score</span>
            <p className="analytics-label">across this week</p>
          </div>
          <div className="analytics-icon orange">
            <img src={chart_icon} />
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-left">
            <div className="analytics-change-pill red">
              <span>
                <img src={trending_down} />
              </span>
              -5% this week
            </div>
            <h3 className="analytics-value">78%</h3>
            <span className="analytics-change">Completion rate</span>
            <p className="analytics-label">modules finished</p>
          </div>
          <div className="analytics-icon orange">
            <img src={prize_icon} />
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-left">
            <h3 className="analytics-value">12.5</h3>
            <span className="analytics-change">minutes on average</span>
            <p className="analytics-label">time per simulation</p>
          </div>
          <div className="analytics-icon orange">
            <img src={clock_icon} />
          </div>
        </div>
      </div>


      {/*
      <div className="charts-grid">
        <div className="chart-card">
          <h4 className="chart-title">Weekly Learner Activity</h4>

          <div className="bar-chart">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
              <div className="bar-group" key={day}>
                <p></p>
                <div
                  className="bar"
                  style={{ height: `${[45, 55, 38, 65, 72, 30, 34][i]}%` }}
                />
                <span>{day}</span>
              </div>
            ))}
          </div>
        </div>


        <div className="chart-card center">
          <h4 className="chart-title">Course Completion Rate</h4>

          <div className="donut-chart">
            <div className="donut-center" />
          </div>

          <div className="donut-legend">
            <span><i className="dot completed" /> Completed</span>
            <span><i className="dot progress" /> In Progress</span>
            <span><i className="dot notstarted" /> Not Started</span>
          </div>
        </div>

        <div className="chart-card">
          <h4 className="chart-title">Engagement Over Time</h4>

          <div className="line-chart detailed">
            <svg viewBox="0 0 300 180" preserveAspectRatio="none">
              {[0, 25, 50, 75, 100].map((y, i) => (
                <g key={i}>
                  <line
                    x1="40"
                    x2="290"
                    y1={160 - y}
                    y2={160 - y}
                    stroke="#e5e7eb"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="10"
                    y={165 - y}
                    fontSize="11"
                    fill="#6b7280"
                  >
                    {y}
                  </text>
                </g>
              ))}

              {["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"].map(
                (label, i) => (
                  <text
                    key={label}
                    x={40 + i * 42}
                    y="175"
                    fontSize="11"
                    fill="#6b7280"
                  >
                    {label}
                  </text>
                )
              )}

              <polyline
                points="40,80 82,95 124,60 166,75 208,55 250,70"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {[80, 95, 60, 75, 55, 70].map((y, i) => (
                <circle
                  key={i}
                  cx={40 + i * 42}
                  cy={y}
                  r="4"
                  fill="#8b5cf6"
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>

        <div className="quick-actions-grid">
  
          <div className="quick-action primary">
            <div className="action-content">
              <div className="action-title-row">
                <div className="action-icon">+</div>
                <h4>Create Course</h4>
              </div>
              <p>Build your next amazing learning experience</p>
            </div>

            <span className="sparkle">✨</span>
          </div>

          <div className="quick-action secondary">
            <div className="action-content">
              <div className="action-title-row">
                <div className="secondary-icon">✏️</div>
                <h4>Edit Course</h4>
              </div>
              <p>Modify existing content</p>
            </div>
          </div>

        </div>
      </div>
        */}
        
        <div className="skill-breakdown-section">
          <h2 className="section-title margin">Module Performance</h2>
          <p className="analytics-label">How employees are performing across different training modules</p>

          <div className="employee-breakdown">
            <div className="employee-breakdown-view-all">
              <button onClick={() => setShowAll(prev => !prev)}>
                {showAll ? "View Less" : "View All"}
              </button>
            </div>
            { modulePerformance.slice(0, showAll ? modulePerformance.length : 2).map((p) => 
              <div className="module-breakdown">
                <div className="module-breakdown-left">
                  <h2 className="module-breakdown-title">{p.title}</h2>
                  <p className="module-breakdown-grey">{p.totalEnrolled} employees enrolled</p>
                  <p className="module-breakdown-grey small">Average Score</p>
                  <div className="module-breakdown-bar">
                    <div className="module-breakdown-bar-fill blue" style={{ width: `${p.avgScore}%` }}/>
                  </div>
                </div>
                <div className="module-breakdown-right">
                  <div className="module-breakdown-stats">
                    <div className="module-breakdown-stat">
                      <h2>{p.avgScore}%</h2>
                      <p>Avg score</p>
                    </div>
                    <div className="module-breakdown-stat">
                      <h2>{p.completion}%</h2>
                      <p>Completion</p>
                    </div>
                  </div>
                  <p className="module-breakdown-grey small">Completion</p>
                  <div className="module-breakdown-bar">
                    <div className="module-breakdown-bar-fill orange" style={{ width: `${p.completion}%` }}/>
                  </div>
                </div>
              </div>
          )}
          </div>
        </div>

        <div className="employee-rankings">
          <div className="employee-ranking skill-breakdown-section">
            <div className="employee-ranking-top">
              <div className="employee-ranking-title">
                <h2 className="section-title margin" >Top Performers</h2>
                <p className="analytics-label">Employees excelling in lessons</p>
              </div>
              <img src={leaderboard_icon} />
            </div>
            <div className="employee-leaderboard">
              { employeeRankings.sort((a, b) => a.ranking - b.ranking).map((e) =>
                <div className="leaderboard-item">
                  <div className="leaderboard-info">
                    <div className="leaderboard-rank">
                      <h2>{e.ranking}</h2>
                    </div>
                    <div className="leaderboard-name">
                      <h3>{e.name}</h3>
                      <p>{e.department}</p>
                    </div>
                  </div>
                  <div className="leaderboard-stats">
                    <h4>{e.score}%</h4>
                    <p>{e.totalCompletedLessons} lessons</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="employee-ranking skill-breakdown-section">
            <div className="employee-ranking-top">
              <div className="employee-ranking-title">
                <h2 className="section-title margin">Needs Attention</h2>
                <p className="analytics-label">Employees who may need additional support</p>
              </div>
              <img src={warning_icon} />
            </div>
            <div className="employee-leaderboard">
              { needAttention.map((e) =>
                <div className="leaderboard-item">
                  <div className="leaderboard-info">
                    <div className="leaderboard-rank red">
                      <h2>!</h2>
                    </div>
                    <div className="leaderboard-name">
                      <h3>{e.name}</h3>
                      <p>{e.department}</p>
                    </div>
                  </div>
                  <div className="leaderboard-stats red">
                    <h4>{e.score}%</h4>
                    <p>{e.totalCompletedLessons} lessons</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Employee Directory */}
            <div className="card employee-section">
              <div className="employee-header">
                <h4 className="card-title">
                  Total Employees <span className="employee-count">: 1285 persons</span>
                </h4>

                <div className="employee-controls">
                  <input
                    className="employee-search"
                    placeholder="Search payroll or name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  <button className="control-btn">Filter</button>
                  <button className="control-btn">Sort</button>
                </div>
              </div>

              <div className="employee-grid">
              {visibleEmployees.map((_, i) => (

                <div className="employee-card" key={i}>

                  {/* Main info */}
                  <div className="employee-main">
                    <img src={`https://i.pravatar.cc/64?img=${i + 10}`} 
                    onClick={() => {setProfileOpen(true); setChosenProfile(i)}} />
                    <div>
                      <p className="employee-name">{janeCooper.fullName}</p>
                      <p className="employee-email">{janeCooper.jobTitle}</p>
                    </div>
                  </div>

                  {/* Role row 
                  <div className="employee-role">
                    <span className="role-pill">
                      <span className="dot" />
                      Finance
                    </span>
                    <span className="divider" />
                    <span className="role-title">Sr. Accountant</span>
                  </div> */}

        <hr />

              {/* Footer */}
              <div className="employee-footer">
                <div>
                  <p className="meta-label">Payroll</p>
                  <p>121948ASH</p>
                </div>
                <div>
                  <p className="meta-label">Join Date</p>
                  <p>{janeCooper.joinDate}</p>
                </div>
              </div>
      </div>

        ))}
      </div>

      </div>

      <ProfilePage key={chosenProfile} open={profileOpen} onClose={() => setProfileOpen(false)} user={janeCooper} viewer={viewer} tempPfp={`https://i.pravatar.cc/64?img=${(chosenProfile ?? 0) + 10}`} />
    </div>
  );
}
