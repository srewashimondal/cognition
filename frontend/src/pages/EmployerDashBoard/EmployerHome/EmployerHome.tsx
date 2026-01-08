import "./EmployerHome.css";

export default function EmployerHome() {
  return (
    <div className="employer-dashboard">
      <h2 className="page-title">Dashboard</h2>

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
    </div>
  );
}
