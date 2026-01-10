import './EmployerDashBoard.css';
import { Routes, Route, Navigate, Link, NavLink } from "react-router-dom";
import Analytics from "./Analytics/Analytics";
import Modules from "./Modules/Modules";
import Lessons from "./Modules/Lessons/Lessons.tsx";
import EmployerHome from './EmployerHome/EmployerHome';
import Resources from "./Resources/Resources";
import AIStudio from './AI Studio/AIStudio';
import Settings from "./Settings/Settings";
import logo from '../../assets/branding/cognition-logo.png';
import bell from '../../assets/icons/bell.svg';

import white_home from '../../assets/icons/sidebar/white-home-icon.svg';
import black_home from '../../assets/icons/sidebar/black-home-icon.svg';
import blue_home from '../../assets/icons/sidebar/blue-home-icon.svg';
import white_pie from '../../assets/icons/sidebar/white-pie-icon.svg';
import black_pie from '../../assets/icons/sidebar/black-pie-icon.svg';
import blue_pie from '../../assets/icons/sidebar/blue-pie-icon.svg';
import white_robot from '../../assets/icons/sidebar/white-robot-icon.svg';
import black_robot from '../../assets/icons/sidebar/black-robot-icon.svg';
import blue_robot from '../../assets/icons/sidebar/blue-robot-icon.svg';
import white_gear from '../../assets/icons/sidebar/white-gear-icon.svg';
import black_gear from '../../assets/icons/sidebar/black-gear-icon.svg';
import blue_gear from '../../assets/icons/sidebar/blue-gear-icon.svg';
import white_folder from '../../assets/icons/sidebar/white-folder-icon.svg';
import black_folder from '../../assets/icons/sidebar/black-folder-icon.svg';
import blue_folder from '../../assets/icons/sidebar/blue-folder-icon.svg';
import white_clipboard from '../../assets/icons/sidebar/white-clipboard-icon.svg';
import black_clipboard from '../../assets/icons/sidebar/black-clipboard-icon.svg';
import blue_clipboard from '../../assets/icons/sidebar/blue-clipboard-icon.svg';


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
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
                <img className="sidebar-icon white" src={white_home} />
                <img className="sidebar-icon black" src={black_home} />
                <img className="sidebar-icon blue" src={blue_home} />
              </div>
              Employer Homepage
            </div>
          </NavLink>


          <NavLink to="/employer/analytics" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
                <img className="sidebar-icon white" src={white_pie} />
                <img className="sidebar-icon black" src={black_pie} />
                <img className="sidebar-icon blue" src={blue_pie} />
              </div>
              Analytics
            </div>
          </NavLink>
          
          {/* <NavLink to="/employer/lessons" className="nav-item">
            Lessons
          </NavLink> */}

          <NavLink to="/employer/modules" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
                <img className="sidebar-icon white" src={white_clipboard} />
                <img className="sidebar-icon black" src={black_clipboard} />
                <img className="sidebar-icon blue" src={blue_clipboard} />
              </div>
              Modules
            </div>
          </NavLink>

          <NavLink to="/employer/ai-studio" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
                <img className="sidebar-icon white" src={white_robot} />
                <img className="sidebar-icon black" src={black_robot} />
                <img className="sidebar-icon blue" src={blue_robot} />
              </div>
              AI Studio
            </div>
          </NavLink>

          <NavLink to="/employer/resources" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
                <img className="sidebar-icon white" src={white_folder} />
                <img className="sidebar-icon black" src={black_folder} />
                <img className="sidebar-icon blue" src={blue_folder} />
              </div>
              Resources
            </div>
          </NavLink>

          <NavLink to="/employer/settings" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
                <img className="sidebar-icon white" src={white_gear} />
                <img className="sidebar-icon black" src={black_gear} />
                <img className="sidebar-icon blue" src={blue_gear} />
              </div>
              Settings
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
            <Route path="modules" element={<Modules />} />
            <Route path="modules/:id" element={<Lessons />} />
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
