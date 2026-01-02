import './EmployerDashBoard.css';
import { Routes, Route, Navigate, Link, NavLink } from "react-router-dom";
import Analytics from "./Analytics/Analytics";
import Lessons from "./Modules/Lessons/Lessons";
import Modules from "./Modules/Modules";
import EmployerHome from './EmployerHome/EmployerHome';
import Resources from "./Resources/Resources";
import AIStudio from './AI Studio/AIStudio';
import Settings from "./Settings/Settings";
import logo from '../../assets/branding/cognition-logo.png';
import bell from '../../assets/icons/bell.svg';
/*import EmployeeDashBoard from '../EmployeeDashBoard/EmployeeDashBoard';*/
import AIStudioAssignments from './AI Studio/AIStudioAssignments/AIStudioAssignments';

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
            🏠︎ Employer Homepage
          </NavLink>


          <NavLink to="/employer/analytics" className="nav-item">
            Analytics
          </NavLink>
          
          {/* <NavLink to="/employer/lessons" className="nav-item">
            Lessons
          </NavLink> */}

          <NavLink to="/employer/modules" className="nav-item">
            Modules
          </NavLink>

          <NavLink to="/employer/ai-studio" className="nav-item">
            AI Studio
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
            <Route path="analytics" element={<Analytics />} />
            <Route path="lessons" element={<Lessons />} />
            <Route path="modules" element={<Modules />} />
            <Route path="resources" element={<Resources />} />
            <Route path="ai-studio" element={<AIStudio />} />
            <Route
              path="ai-studio/:moduleId/assignments"
              element={<AIStudioAssignments />}
            />
            <Route path="settings" element={<Settings />} />

            <Route path="*" element={<Navigate to="" />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}
