import './EmployeeDashBoard.css';
import { Routes, Route, Navigate, Link, NavLink } from "react-router-dom";
import { useState } from "react";
import logo from '../../assets/branding/cognition-logo.png';
import bell from '../../assets/icons/bell.svg';
import down_chevron from '../../assets/icons/black-down-chevron.svg';
import ProfilePage from "../EmployerDashBoard/ProfilePage/ProfilePage";
import PerformanceDashboard from "./PerformanceDashboard/PerformanceDashboard";
import SimulationLessonView from './SimulationLessonView/SimulationLessonView/SimulationLessonView';
import SimulationView from './SimulationView/SimulationView';
import StandardLessonView from './StandardLessonView/StandardLessonView';
import EmployeeHome from './EmployeeHome/EmployeeHome';
import EmployeeModules from './EmployeeModules/EmployeeModules';
import Schedule from './Schedule/Schedule';

export default function EmployeeDashBoard() {
    const [profileOpen, setProfileOpen] = useState(false);
      
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
            to="/employee"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
              </div>
              Employee Homepage
            </div>
          </NavLink>


          <NavLink to="/employee/performance" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
              </div>
              Performance Dashboard
            </div>
          </NavLink>
          
          {/* <NavLink to="/employer/lessons" className="nav-item">
            Lessons
          </NavLink> */}

          <NavLink to="/employee/modules" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
              </div>
              Modules
            </div>
          </NavLink>

          <NavLink to="/employee/simulation-lesson-view" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
              </div>
              Simulation Lesson View
            </div>
          </NavLink>

          <NavLink to="/employee/simulation-view" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
              </div>
              Simulation View
            </div>
          </NavLink>

          <NavLink to="/employee/standard-lesson-view" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
              </div>
              Standard Lesson View
            </div>
          </NavLink>

          <NavLink to="/employee/schedule" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
              </div>
              Schedule
            </div>
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

            <div
              className="user-menu"
              onClick={() => setProfileOpen(true)}
            >
              <img
                src="https://i.etsystatic.com/30289585/r/il/3f982c/4322819070/il_fullxfull.4322819070_tn35.jpg"
                className="avatar"
              />
              <span className="username">Harsh</span>
              <span className="caret">
                <img src={down_chevron} />
              </span>
            </div>

          </div>
        </header>

        <section className="content">
          <Routes>
            <Route index element={<EmployeeHome />} />
            <Route path="performance" element={<PerformanceDashboard />} />
            <Route path="modules" element={<EmployeeModules />} />
            <Route path="simulation-lesson-view" element={<SimulationLessonView />} />
            <Route path="simulation-view" element={<SimulationView />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="standard-lesson-view" element={<StandardLessonView />} />
            <Route path="*" element={<Navigate to="" />} />
          </Routes>
        </section>
      </main>

      <ProfilePage open={profileOpen} onClose={() => setProfileOpen(false)} />
        
    </div>
    );
}