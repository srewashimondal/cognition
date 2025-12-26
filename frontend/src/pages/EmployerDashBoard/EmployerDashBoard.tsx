import './EmployerDashBoard.css';

export default function EmployerDashBoard() {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-text">Cognition</span>
        </div>

        <nav className="nav">
          <button className="nav-item active"> 🏠︎ Employer Dashboard</button>
          <button className="nav-item">Assignments</button>
          <button className="nav-item">Schedule</button>
          <button className="nav-item">Recordings</button>
          <button className="nav-item">Cognition AI</button>
          <button className="nav-item">Resources</button>
          <button className="nav-item">Notes</button>
          <button className="nav-item">Map Layouts</button>
          <button className="nav-item">Modules Completed</button>
          <button className="nav-item">Courses</button>
          <button className="nav-item">Settings</button>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="search-wrapper">
            <span className="search-icon">🔍︎</span>
            <input
                className="search-input"
                placeholder="Search by Employee Name or ID"
            />
          </div>

          <div className="topbar-right">
            <div className="notif">
                <span className="bell">🔔</span>
                <span className="notif-dot" />
            </div>

            <div className="user-menu">
                <img
                src="https://i.etsystatic.com/30289585/r/il/3f982c/4322819070/il_fullxfull.4322819070_tn35.jpg" 
                alt="profile"
                className="avatar"
                />
                <span className="username">Harsh</span>
                <span className="caret">▾</span>
            </div>
            </div>
        </header>

        <section className="content">
            <h1>Employee Name: John Doe</h1>

            <div className="dashboard-row">
                {/* Recent Course */}
                <div className="card">
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
                </div>

                {/* Resources */}
                <div className="card">
                <h3 className="card-title">Your Resources</h3>

                <ul className="resource-list">
                    <li>
                    <span>📄 auto-layout.pdf</span>
                    <span className="resource-size">2.5 MB</span>
                    </li>
                    <li>
                    <span>📄 onboarding.ppt</span>
                    <span className="resource-size">1.2 MB</span>
                    </li>
                    <li>
                    <span>🖼️ basics_ui.png</span>
                    <span className="resource-size">1.8 MB</span>
                    </li>
                </ul>

                <button className="see-more">see more</button>
                </div>

                {/* Calendar */}
                {/* Calendar */}
                <div className="card calendar-card">
                <h3 className="card-title">June 2025</h3>

                <div className="calendar-grid">
                    {Array.from({ length: 30 }).map((_, i) => (
                    <div
                        key={i}
                        className={`calendar-day ${i === 16 ? 'active-day' : ''}`}
                    >
                        {i + 1}
                    </div>
                    ))}
                </div>
                </div>
            </div>
        </section>

      </main>
    </div>
  );
}
