import "./EmployerHome.css";
import { useState } from "react";

const employees = Array.from({ length: 9 });

export default function EmployerHome() {
  const [search, setSearch] = useState("");

  const visibleEmployees = employees.filter(() => {
  if (!search) return true;

  const term = search.toLowerCase();
    return (
      "jane cooper".includes(term) ||
      "121948ash".includes(term)
    );
  });


  return (
  
    <div className="employer-dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-left">
          <h3 className="welcome-title">
            Welcome back, Alex! <span className="wave">👋</span>
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
      <h3 className="section-title">Analytics Overview</h3>

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


      {/* Main Content Grid */}
      <div className="main-grid">
        <div className="card large">
          <h4 className="card-title">Training Progress</h4>
          <p className="card-muted">
            Overview of employee training completion
          </p>
          <div className="placeholder-chart" />
        </div>

        <div className="card">
          <h4 className="card-title">Recent Activity</h4>
          <ul className="activity-list">
            <li>✔ John completed “Safety Training”</li>
            <li>📘 5 employees started “POS Basics”</li>
            <li>⚠ 3 assignments overdue</li>
          </ul>
        </div>

        <div className="card">
          <h4 className="card-title">Quick Actions</h4>
          <div className="actions">
            <button>Add Training</button>
            <button>Assign Module</button>
            <button>View Reports</button>
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
                    <img src={`https://i.pravatar.cc/64?img=${i + 10}`} />
                    <div>
                      <p className="employee-name">Jane Cooper</p>
                      <p className="employee-email">janecooper@gmail.com</p>
                    </div>
                  </div>

                  {/* Role row */}
                  <div className="employee-role">
                    <span className="role-pill">
                      <span className="dot" />
                      Finance
                    </span>
                    <span className="divider" />
                    <span className="role-title">Sr. Accountant</span>
                  </div>

        <hr />

              {/* Footer */}
              <div className="employee-footer">
                <div>
                  <p className="meta-label">Payroll</p>
                  <p>121948ASH</p>
                </div>
                <div>
                  <p className="meta-label">Join Date</p>
                  <p>Feb 23, 2025</p>
                </div>
              </div>
      </div>

        ))}
      </div>

      </div>
    </div>
  );
}
