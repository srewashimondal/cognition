import "./EmployerHome.css";
import { useState, useEffect } from "react";
import { janeCooper } from "../../../dummy_data/user_data";
import ProfilePage from "../ProfilePage/ProfilePage";

const employees = Array.from({ length: 9 });

export default function EmployerHome({ viewer }: { viewer: Record<string, string> }) {
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [chosenProfile, setChosenProfile] = useState<number | null>(null); // change to a different key later

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

  return (
  
    <div className="employer-dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-left">
          <h3 className="welcome-title">
            Welcome back, Alex! <span className="wave"></span>
          </h3>
          <p className="welcome-subtitle">
            Shape the future of learning with innovative courses
          </p>

          <div className="welcome-stats">
            <div className="stat">
              <h4>12</h4>
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
        <h3 className="section-title">Analytics Overview</h3>
      </div>
  
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-left">
            <p className="analytics-label">Total Learners</p>
            <h3 className="analytics-value">247</h3>
            <span className="analytics-change positive">↗ +12% this week</span>
          </div>
          <div className="analytics-icon purple">👥</div>
        </div>

        <div className="analytics-card">
          <div className="analytics-left">
            <p className="analytics-label">Active Courses</p>
            <h3 className="analytics-value">12</h3>
            <span className="analytics-change blue">↗ +2 this month</span>
          </div>
          <div className="analytics-icon blue">📘</div>
        </div>

        <div className="analytics-card">
          <div className="analytics-left">
            <p className="analytics-label">Certificates Issued</p>
            <h3 className="analytics-value">89</h3>
            <span className="analytics-change positive">↗ +23% this month</span>
          </div>
          <div className="analytics-icon green">🎖️</div>
        </div>

        <div className="analytics-card">
          <div className="analytics-left">
            <p className="analytics-label">Avg. Completion</p>
            <h3 className="analytics-value">94%</h3>
            <span className="analytics-change purple">↗ +5% this month</span>
          </div>
          <div className="analytics-icon orange">📈</div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="charts-grid">
        {/* Weekly Learner Activity */}
        <div className="chart-card">
          <h4 className="chart-title">Weekly Learner Activity</h4>

          <div className="bar-chart">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
              <div className="bar-group" key={day}>
                <div
                  className="bar"
                  style={{ height: `${[45, 55, 38, 65, 72, 30, 34][i]}%` }}
                />
                <span>{day}</span>
              </div>
            ))}
          </div>
        </div>



        {/* Course Completion Rate */}
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

        {/* Engagement Over Time */}
        <div className="chart-card">
          <h4 className="chart-title">Engagement Over Time</h4>

          <div className="line-chart detailed">
            <svg viewBox="0 0 300 180" preserveAspectRatio="none">
              {/* Grid lines */}
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

              {/* X-axis labels */}
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

              {/* Line */}
              <polyline
                points="40,80 82,95 124,60 166,75 208,55 250,70"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dots */}
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

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>

        <div className="quick-actions-grid">
          {/* Primary action */}
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


          {/* Secondary actions */}
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
