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
        </section>
      </main>
    </div>
  );
}
