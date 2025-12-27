import './EmployerDashBoard.css';
import { Routes, Route, Navigate, Link, NavLink } from "react-router-dom";
import EmployerHome from "./EmployerHome";
import Assignments from "./Assignments";
import Schedule from "./Schedule";
import Recordings from "./Recordings";
import Resources from "./Resources";
import Settings from "./Settings";
import logo from '../../assets/branding/cognition-logo.png';
import bell from '../../assets/icons/bell.svg';

export default function EmployerDashBoard() {
  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <Link to="/">
          <div className="logo">
            <span className="logo-img">
              <img src={logo}/>
            </span>
            <span className="logo-text">Cognition</span>
          </div>
        </Link>

        <nav className="nav">
          <NavLink
            end
            to="/employer"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            🏠︎ Employer Dashboard
          </NavLink>


          <NavLink to="/employer/assignments" className="nav-item">
            Assignments
          </NavLink>


          <NavLink to="/employer/schedule" className="nav-item">
            Schedule
          </NavLink>

          <NavLink to="/employer/recordings" className="nav-item">
            Recordings
          </NavLink>

          <NavLink to="/employer/resources" className="nav-item">
            Resources
          </NavLink>

          <NavLink to="/employer/settings" className="nav-item">
            Settings
          </NavLink>
        </nav>

      </aside>

      {/* Main layout */}
      <main className="main">
        {/* Topbar */}
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
              <span className="bell">
                <img src={bell}/>
              </span>
              <span className="notif-dot" />
            </div>

            <div className="user-menu">
              <img
                src="https://i.etsystatic.com/30289585/r/il/3f982c/4322819070/il_fullxfull.4322819070_tn35.jpg"
                className="avatar"
              />
              <span className="username">Harsh</span>
              <span className="caret">▾</span>
            </div>
          </div>
        </header>

        <section className="content">
          <Routes>
            <Route index element={<EmployerHome />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="recordings" element={<Recordings />} />
            <Route path="resources" element={<Resources />} />
            <Route path="settings" element={<Settings />} />

            <Route path="*" element={<Navigate to="" />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}
