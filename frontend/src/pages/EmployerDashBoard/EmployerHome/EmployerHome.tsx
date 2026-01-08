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
      <h2 className="page-title">Employer HomePage: Dashboard</h2>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <p className="kpi-label">Active Employees</p>
          <h3 className="kpi-value">216</h3>
          <span className="kpi-sub positive">+2% this month</span>
        </div>

        <div className="kpi-card">
          <p className="kpi-label">Ongoing Trainings</p>
          <h3 className="kpi-value">12</h3>
          <span className="kpi-sub">Across 4 departments</span>
        </div>

        <div className="kpi-card">
          <p className="kpi-label">Pending Assignments</p>
          <h3 className="kpi-value">38</h3>
          <span className="kpi-sub warning">Needs review</span>
        </div>

        <div className="kpi-card">
          <p className="kpi-label">Completion Rate</p>
          <h3 className="kpi-value">82%</h3>
          <span className="kpi-sub positive">↑ improving</span>
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
