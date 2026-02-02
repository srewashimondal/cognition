import './EmployeeDashBoard.css';
import { Routes, Route, Navigate, Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useMatch } from "react-router-dom";
import { Tooltip } from "@radix-ui/themes";
import logo from '../../assets/branding/cognition-logo.png';
import bell from '../../assets/icons/bell.svg';
import sidebar_icon from '../../assets/icons/sidebar-icon.svg';
import ProfilePage from "../EmployerDashBoard/ProfilePage/ProfilePage";
/*
import SimulationLessonView from './SimulationLessonView/SimulationLessonView/SimulationLessonView';
import SimulationView from './SimulationView/SimulationView';
*/
import StandardModules from './StandardModules/StandardModules';
import SimulationModules from './SimulationModules/SimulationModules';
import EmployeeHome from './EmployeeHome/EmployeeHome';
import Schedule from './Schedule/Schedule';
import EmployeeResources from './Resources/EmployeeResources';
import EmployeeSettings from './Settings/EmployeeSettings';
import SimulationLessons from './SimulationModules/SimulationLessons/SimulationLessons';
import SimulationPage from '../Simulation/SimulationPage';
import StandardLessons from './StandardModules/StandardLessons/StandardLessons';
import StandardLessonPage from '../StandardLesson/StandardLessonPage';
import { employee } from '../../dummy_data/user_data';
import { workspace } from '../../dummy_data/workspace_data';

import white_home from '../../assets/icons/sidebar/white-home-icon.svg';
import black_home from '../../assets/icons/sidebar/black-home-icon.svg';
import blue_home from '../../assets/icons/sidebar/blue-home-icon.svg';
import white_gear from '../../assets/icons/sidebar/white-gear-icon.svg';
import black_gear from '../../assets/icons/sidebar/black-gear-icon.svg';
import blue_gear from '../../assets/icons/sidebar/blue-gear-icon.svg';
import white_folder from '../../assets/icons/sidebar/white-folder-icon.svg';
import black_folder from '../../assets/icons/sidebar/black-folder-icon.svg';
import blue_folder from '../../assets/icons/sidebar/blue-folder-icon.svg';
import white_calendar from '../../assets/icons/sidebar/white-calendar-icon.svg';
import black_calendar from '../../assets/icons/sidebar/black-calendar-icon.svg';
import blue_calendar from '../../assets/icons/sidebar/blue-calendar-icon.svg';
import white_vl from '../../assets/icons/sidebar/white-vl-icon.svg';
import black_vl from '../../assets/icons/sidebar/black-vl-icon.svg';
import blue_vl from '../../assets/icons/sidebar/blue-vl-icon.svg';
import white_controller from '../../assets/icons/sidebar/white-controller-icon.svg';
import black_controller from '../../assets/icons/sidebar/black-controller-icon.svg';
import blue_controller from '../../assets/icons/sidebar/blue-controller-icon.svg';
import SimulationPerformance from './SimulationModules/SimulationLessons/SimulationPerformance/SimulationPerformance';


export default function EmployeeDashBoard() {
    const [profileOpen, setProfileOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const isSimulationPage = useMatch("/employee/simulations/:moduleID/:lessonID/:simIdx");
    const isSimulationLesson = useMatch("/employee/simulations/:moduleID");
    const isStandardLesson = useMatch("/employee/standard-modules/:moduleID");
    const isStandardLessonPg = useMatch("/employee/standard-modules/:moduleID/:lessonID");
    const isPerformancePg = useMatch("/employee/simulations/:moduleId/performance");

    const mockCurrentUser = {
      id: "employee-1",
      role: "employee",
    };

    return (
    <div className={`dashboard employee ${sidebarCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar */}
      <aside className="sidebar">
          <div className="logo">
            <Link to="/">
              <span className="logo-img">
                <img src={logo}/>
              </span>
            </Link>
            {(!sidebarCollapsed) && <span className="logo-text">Cognition</span>}
          </div>
        
          <div className="workspace-title">
            <img className="avatar" src={workspace.icon} />
            {(!sidebarCollapsed) && 
              <div className="workspace-label">
                <p>Workspace</p>
                <h4>{workspace.name}</h4>
              </div>
            }
          </div>

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
                <img className="sidebar-icon white" src={white_home} />
                <img className="sidebar-icon black" src={black_home} />
                <img className="sidebar-icon blue" src={blue_home} />
              </div>
              {(!sidebarCollapsed) && "Employee Home" }
            </div>
          </NavLink>
          
          {/* <NavLink to="/employer/lessons" className="nav-item">
            Lessons
          </NavLink> */}

          <NavLink to="/employee/simulations" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap sim">
                <img className="sidebar-icon white" src={white_controller} />
                <img className="sidebar-icon black" src={black_controller} />
                <img className="sidebar-icon blue" src={blue_controller} />
              </div>
              {(!sidebarCollapsed) && "Simulations" }
            </div>
          </NavLink>

          <NavLink to="/employee/standard-modules" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
                <img className="sidebar-icon white" src={white_vl} />
                <img className="sidebar-icon black" src={black_vl} />
                <img className="sidebar-icon blue" src={blue_vl} />
              </div>
              {(!sidebarCollapsed) && "Standard Modules"}
            </div>
          </NavLink>
            {/*
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
            */}
          <NavLink to="/employee/schedule" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
                <img className="sidebar-icon white" src={white_calendar} />
                <img className="sidebar-icon black" src={black_calendar} />
                <img className="sidebar-icon blue" src={blue_calendar} />
              </div>
              {(!sidebarCollapsed) && "Schedule" }
            </div>
          </NavLink>

          <NavLink to="/employee/resources" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
                <img className="sidebar-icon white" src={white_folder} />
                <img className="sidebar-icon black" src={black_folder} />
                <img className="sidebar-icon blue" src={blue_folder} />
              </div>
              {(!sidebarCollapsed) && "Resources" }
            </div>
          </NavLink>

          <NavLink to="/employee/settings" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
                <img className="sidebar-icon white" src={white_gear} />
                <img className="sidebar-icon black" src={black_gear} />
                <img className="sidebar-icon blue" src={blue_gear} />
              </div>
              {(!sidebarCollapsed) && "Settings" }
            </div>
          </NavLink>
        </nav>

      </aside>

      {/* Main layout */}
      <main className="main employee">
        {/* Topbar */}
        <header className="topbar employee">
          {/*
          <div className="search-wrapper">
            <span className="search-icon">🔍︎</span>
            <input
              className="search-input"
              placeholder="Search by Employee Name or ID"
            />
          </div>*/}

          <Tooltip content={sidebarCollapsed ? "Open sidebar" : "Close sidebar"}>
            <div className="sidebar-toggle" onClick={() => setSidebarCollapsed(prev => !prev)} >
              <img src={sidebar_icon} />
            </div>
          </Tooltip>

          <div className="topbar-right">
            <Tooltip content="View notifications">
              <div className="notif">
                <span className="bell">
                  <img src={bell}/>
                </span>
                <span className="notif-dot" />
              </div>
            </Tooltip>

            <Tooltip content="View profile">
              <div
                className="user-menu"
                onClick={() => setProfileOpen(prev => !prev)}
              >
                <img
                  src={employee.profilePicture}
                  className="avatar"
                />
                {/*<span className="username">{employee.fullName}</span>
                <span className="caret">
                  {(profileOpen) ? <img src={left_chevron} /> : <img src={down_chevron} />}
                </span>*/}
              </div>
            </Tooltip>

          </div>
        </header>

        <section className={`content employee ${(isSimulationPage || isSimulationLesson || isStandardLesson || isStandardLessonPg || isPerformancePg) ? "no-padding" : ""}`}>
          <Routes>
            <Route index element={<EmployeeHome />} />
            <Route path="simulations" element={<SimulationModules />} />
            <Route path="simulations/:moduleID" element={<SimulationLessons />} />
            <Route path="simulations/:moduleID/:lessonID/:simIdx" element={<SimulationPage role={"employee"} />} />
            {/*<Route path="simulation-lesson-view" element={<SimulationLessonView />} />
            <Route path="simulation-view" element={<SimulationView />} />*/}
            <Route path="simulations/:moduleId/performance" element={<SimulationPerformance />}/>
            <Route path="schedule" element={<Schedule />} />
            <Route path="standard-modules" element={<StandardModules />} />
            <Route path="standard-modules/:moduleID" element={<StandardLessons />} />
            <Route path="standard-modules/:moduleID/:lessonID" element={<StandardLessonPage />} />
            <Route path="resources" element={<EmployeeResources />} />
            <Route path="settings" element={<EmployeeSettings />} />
            <Route path="*" element={<Navigate to="" />} />
          </Routes>
        </section>
      </main>

      <ProfilePage open={profileOpen} onClose={() => setProfileOpen(false)} user={employee} viewer={mockCurrentUser} />
        
    </div>
    );
}