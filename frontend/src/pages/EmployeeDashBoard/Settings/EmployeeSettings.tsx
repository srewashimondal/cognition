import { useState, useEffect } from "react";
import "./EmployeeSettings.css";
import eye_on from '../../../assets/icons/eye_on.svg';
import eye_off from '../../../assets/icons/eye_off.svg';

type Tab = "account" | "security" | "notifications" | "interface" ;


export default function EmployeeSettings() {
  const [activeTab, setActiveTab] = useState<Tab>("account");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div className="settings-page">
      {/* Tabs */}
      <div className="settings-tabs">
        <span
          className={activeTab === "account" ? "active" : ""}
          onClick={() => setActiveTab("account")}
        >
          Account Setting
        </span>

        {/*<span
          className={activeTab === "security" ? "active" : ""}
          onClick={() => setActiveTab("security")}
        >
          Login & Security
        </span>*/}

        <span
          className={activeTab === "notifications" ? "active" : ""}
          onClick={() => setActiveTab("notifications")}
        >
          Notifications
        </span>

        <span
          className={activeTab === "interface" ? "active" : ""}
          onClick={() => setActiveTab("interface")}
        >
          Interface
        </span>

      </div>

      <hr />

      {/* CONTENT */}
      {activeTab === "account" && <AccountSettings />}
      {/*activeTab === "security" && <SecuritySettings />*/}
      {activeTab === "notifications" && <NotificationSettings />}
      {activeTab === "interface" && <InterfaceSettings />}
    </div>
  );
}

function AccountSettings() {
  return (
    <div className="account-settings">
      <h3 className="security-title">Account Information</h3>
      <div className="form-grid">
        <div>
          <label>Full name</label>
          <input placeholder="Please enter your full name" />
        </div>

        <div>
          <label>Email</label>
          <input placeholder="Please enter your email" />
        </div>

        <div>
          <label>Username</label>
          <input placeholder="Please enter your username" />
        </div>

        <div>
          <label>Phone number</label>
          <input placeholder="Please enter your phone number" />
        </div>
      </div>

      <div className="bio-section">
        <label>Bio</label>
        <textarea placeholder="Write your Bio here e.g your hobbies, interests ETC" />
      </div>

      <div className="actions">
        <button className="primary">Save Changes</button>
        <button className="secondary">Reset</button>
      </div>
      <div className="security-wrapper">
        {SecuritySettings()}
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [viewCurrentPassword, setViewCurrentPassword] = useState(false);
  const [viewNewPassword, setViewNewPassword] = useState(false);

  return (
    <div className="security-section">
      {/* Header */}
      <h3 className="security-title">Password & Security</h3>
      <p className="security-subtitle">
        Manage your password and account security.
      </p>

      {/* Password Fields */}
      <div className="form-grid">
        <div className="password-field">
          <label>Current password</label>
          <input type={viewCurrentPassword ? "text" : "password"} placeholder="••••••••" />
          <span className="eye" onClick={() => setViewCurrentPassword(prev => !prev)}>
            <img src={viewCurrentPassword ? eye_on : eye_off}/>
          </span>
        </div>

        <div className="password-field">
          <label>New password</label>
          <input type={viewNewPassword ? "text" : "password"} placeholder="Enter new password" />
          <span className="eye" onClick={() => setViewNewPassword(prev => !prev)}>
            <img src={viewNewPassword ? eye_on : eye_off} />
          </span>
        </div>
      </div>

      {/* Password Strength */}
      <div className="password-strength">
        <span>Password strength</span>
        <div className="strength-bar">
          <div className="strength-fill strong" />
        </div>
        <span className="strength-label">Strong</span>
      </div>

      <hr />

      {/* 2FA */}
      <div className="two-factor">
        <div>
          <h4>Two-factor authentication</h4>
          <p>Add an extra layer of security to your account</p>
        </div>

        <label className="switch">
          <input type="checkbox" />
          <span className="slider" />
        </label>
      </div>

      {/* Action */}
      <div className="actions">
        <button className="primary">Update Password</button>
      </div>
    </div>
  );
}


function NotificationSettings() {
  return (
    <div className="notifications-section">
      <h3 className="section-title">Notification Preferences</h3>
      <p className="section-subtitle">
        Choose how you want to receive updates and alerts.
      </p>

      <div className="notification-list">
        {/* Email */}
        <div className="notification-item">
          <div>
            <h4>Email notifications</h4>
            <p>Receive important updates via email</p>
          </div>
          <label className="switch">
            <input type="checkbox" />
            <span className="slider" />
          </label>
        </div>

        {/* SMS */}
        <div className="notification-item">
          <div>
            <h4>SMS notifications</h4>
            <p>Get text messages for critical alerts</p>
          </div>
          <label className="switch">
            <input type="checkbox" />
            <span className="slider" />
          </label>
        </div>

        {/* Product Updates */}
        <div className="notification-item">
          <div>
            <h4>Product updates</h4>
            <p>Stay informed about new features and improvements</p>
          </div>
          <label className="switch">
            <input type="checkbox" />
            <span className="slider" />
          </label>
        </div>
      </div>

      <div className="actions">
        <button className="primary">Save Preferences</button>
      </div>
    </div>
  );
}


function InterfaceSettings() {
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState(14);
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  return (
    <div className="interface-section">
      <h3 className="section-title">Interface Preferences</h3>
      <p className="section-subtitle">
        Customize the interface to improve focus, readability, and comfort.
      </p>

      <div className="interface-card">
        {/* Theme */}
        <div className="interface-row">
          <div>
            <h4>Theme</h4>
            <p>Choose a light or dark interface</p>
          </div>

          <div className="theme-toggle">
            <button
              className={theme === "light" ? "active light" : "light"}
              onClick={() => setTheme("light")}
            >
              ☀ Light
            </button>

            <button
              className={theme === "dark" ? "active dark" : "dark"}
              onClick={() => setTheme("dark")}
            >
              🌙 Dark
            </button>
          </div>
        </div>


        {/* Text size */}
        <div className="interface-row">
          <div>
            <h4>Text size</h4>
            <p>Adjust text for easier reading</p>
          </div>
          <input
            type="range"
            min={12}
            max={18}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
        </div>

        {/* Line spacing */}
        <div className="interface-row">
          <div>
            <h4>Line spacing</h4>
            <p>Increase spacing to reduce visual clutter</p>
          </div>
          <input
            type="range"
            min={1.2}
            max={2}
            step={0.1}
            value={lineSpacing}
            onChange={(e) => setLineSpacing(Number(e.target.value))}
          />
        </div>

        {/* Reduced motion */}
        <div className="interface-row">
          <div>
            <h4>Reduce motion</h4>
            <p>Minimize animations and transitions</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={() => setReducedMotion(!reducedMotion)}
            />
            <span className="slider" />
          </label>
        </div>

        {/* Focus mode */}
        <div className="interface-row">
          <div>
            <h4>Focus mode</h4>
            <p>Increase contrast and reduce distractions</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={focusMode}
              onChange={() => setFocusMode(!focusMode)}
            />
            <span className="slider" />
          </label>
        </div>
      </div>

      <div className="actions">
        <button className="primary">Save Settings</button>
      </div>
    </div>
  );
}

