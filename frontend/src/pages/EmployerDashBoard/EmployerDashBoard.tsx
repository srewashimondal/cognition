import './EmployerDashBoard.css';
import { Routes, Route, Navigate, Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Tooltip } from "@radix-ui/themes";
import Analytics from "./Analytics/Analytics";
import Modules from "./Modules/Modules";
import Lessons from "./Modules/Lessons/Lessons.tsx";
import EmployerHome from './EmployerHome/EmployerHome';
import Resources from "./Resources/Resources";
import AIStudio from './AI Studio/AIStudio';
import Settings from "./Settings/Settings";
import SimulationPage from '../Simulation/SimulationPage.tsx';
import logo from '../../assets/branding/cognition-logo.png';
import bell from '../../assets/icons/bell.svg';
// import down_chevron from '../../assets/icons/black-down-chevron.svg';
import sidebar_icon from '../../assets/icons/sidebar-icon.svg';
// import { workspace } from '../../dummy_data/workspace_data.tsx'; // keep this in case
import { useAuth } from "../../context/AuthProvider.tsx"; 
import { useWorkspace } from '../../context/WorkspaceProvider.tsx';
import defaultIcon from '../../assets/icons/default-icon.svg';

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
import ProfilePage from "./ProfilePage/ProfilePage";
import Builder from './Builder/Builder.tsx';
import StandardBuilder from './StandardBuilder/StandardBuilder.tsx';
import QuizBuilder from './StandardBuilder/QuizBuilder/QuizBuilder.tsx';

export default function EmployerDashBoard() {
  console.log("EmployerDashboard mounted");

  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { pathname } = useLocation();
  const isBuilderPage = pathname.includes("builder");
  const isSimulationPage = pathname.includes("simulations");
  
  const { user, loading: authLoading } = useAuth();
  const { workspace, loading: workspaceLoading } = useWorkspace();

  console.log("Current state:", { 
    authLoading, 
    workspaceLoading, 
    hasUser: !!user, 
    hasWorkspace: !!workspace,
    userRole: user?.role 
  });

  if (authLoading || workspaceLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!workspace) return null;

  console.log("Rendering full dashboard with workspace:", workspace.name);

  return (
    <div className={`dashboard ${sidebarCollapsed ? "collapsed" : ""} ${isBuilderPage ? "white" : ""}`}>
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
              { (!sidebarCollapsed) && "Employer Home" }
            </div>
          </NavLink>


          <NavLink to="/employer/analytics" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
                <img className="sidebar-icon white" src={white_pie} />
                <img className="sidebar-icon black" src={black_pie} />
                <img className="sidebar-icon blue" src={blue_pie} />
              </div>
              { (!sidebarCollapsed) && "Analytics" }
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
              { (!sidebarCollapsed) && "Modules" }
            </div>
          </NavLink>

          <NavLink to="/employer/ai-studio" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
                <img className="sidebar-icon white" src={white_robot} />
                <img className="sidebar-icon black" src={black_robot} />
                <img className="sidebar-icon blue" src={blue_robot} />
              </div>
              { (!sidebarCollapsed) && "AI Studio" }
            </div>
          </NavLink>

          <NavLink to="/employer/resources" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
                <img className="sidebar-icon white" src={white_folder} />
                <img className="sidebar-icon black" src={black_folder} />
                <img className="sidebar-icon blue" src={blue_folder} />
              </div>
              { (!sidebarCollapsed) && "Resources" }
            </div>
          </NavLink>

          <NavLink to="/employer/settings" className="nav-item">
            <div className="sidebar-label">
              <div className="sidebar-icon-swap">
                <img className="sidebar-icon white" src={white_gear} />
                <img className="sidebar-icon black" src={black_gear} />
                <img className="sidebar-icon blue" src={blue_gear} />
              </div>
              { (!sidebarCollapsed) && "Settings" }
            </div>
          </NavLink>
        </nav>

      </aside> 

      {/* Main layout */}
      <main className="main">
        {/* Topbar */}

        <header className="topbar">
        { /*<div className="search-wrapper">
            <span className="search-icon">🔍︎</span>
            <input
              className="search-input"
              placeholder="Search by Employee Name or ID"
            />
          </div>*/ }

          <Tooltip content={sidebarCollapsed ? "Open sidebar" : "Close sidebar"}>
            <div className="sidebar-toggle" onClick={() => setSidebarCollapsed(prev => !prev)}>
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
          
            <Tooltip content={profileOpen ? "Exit profile" : "View profile"}>
              <div
                className="user-menu"
                onClick={() => setProfileOpen(true)}
              >
                <img
                  src={user.profilePicture ?? defaultIcon}
                  className="avatar"
                />
                {/*<span className="username">{employer.fullName}</span>
                <span className="caret">
                  <img src={down_chevron} />
                </span>*/}
              </div>
            </Tooltip>

          </div>
        </header>

        { user && user?.role === "employer" && 
        <section className={`content employer ${(isSimulationPage || isBuilderPage) ? "no-padding" : ""}`}>
          <Routes>
            <Route index element={<EmployerHome viewer={user} workspace={workspace} />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="modules" element={<Modules workspace={workspace}/>} />
            <Route path="resources" element={<Resources workspace={workspace} />} />
            {/* <Route path="modules/:id" element={<Lessons />} />
            <Route path="simulations/:moduleID/:lessonID/:simIdx" element={<SimulationPage role={"employer"} />} />
            <Route path="ai-studio" element={<AIStudio />} />
            <Route
              path="ai-studio/:moduleId/assignments"
              element={<AIStudioAssignments />}
            />
            <Route path="settings" element={<Settings />} />
            <Route path="modules/builder" element={<Builder />} />
            <Route path="modules/builder/:moduleID" element={<Builder />} /> */}
            <Route path="modules/standard-builder" element={<StandardBuilder />} />
            <Route path="modules/standard-builder/:moduleID" element={<StandardBuilder />} />
            <Route path="modules/quiz-builder" element={<QuizBuilder />} /> 
            <Route path="modules/standard-builder/:moduleID/:quizID" element={<QuizBuilder />} /> 
            <Route path="*" element={<Navigate to="/employer" replace/>} /> 
          </Routes> 
        </section> }
      </main>

      {profileOpen && <ProfilePage open={profileOpen} onClose={() => setProfileOpen(false)} user={user} viewer={user} />}
        
    </div>
  );
}
