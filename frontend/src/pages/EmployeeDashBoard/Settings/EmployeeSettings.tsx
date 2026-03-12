import { useState, useEffect } from "react";
import "./EmployeeSettings.css";
import eye_on from '../../../assets/icons/eye_on.svg';
import eye_off from '../../../assets/icons/eye_off.svg';
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import type { EmployeeUserType } from "../../../types/User/UserType";

type Tab = "account" | "security" | "notifications" | "interface";

type EmployeeSettingsProps = {
  user: EmployeeUserType;
};

export default function EmployeeSettings({ user }: EmployeeSettingsProps) {
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
      {activeTab === "account" && <AccountSettings user={user} />}
      {/*activeTab === "security" && <SecuritySettings />*/}
      {activeTab === "notifications" && <NotificationSettings user={user} />}
      {activeTab === "interface" && <InterfaceSettings />}
    </div>
  );
}

function AccountSettings({ user }: { user: EmployeeUserType }) {
  const [fullName, setFullName] = useState(user.fullName ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [jobTitle, setJobTitle] = useState(user.jobTitle ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFullName(user.fullName ?? "");
    setEmail(user.email ?? "");
    setJobTitle(user.jobTitle ?? "");
  }, [user.fullName, user.email, user.jobTitle]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        fullName: fullName.trim(),
        email: email.trim(),
        jobTitle: jobTitle.trim(),
      });
      setSaved(true);
    } catch (e) {
      console.error("Failed to save account settings:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFullName(user.fullName ?? "");
    setEmail(user.email ?? "");
    setJobTitle(user.jobTitle ?? "");
  };

  return (
    <div className="account-settings">
      <h3 className="security-title">Account Information</h3>
      <div className="form-grid">
        <div>
          <label>Full name</label>
          <input
            placeholder="Please enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            placeholder="Please enter your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Job title</label>
          <input
            placeholder="e.g. Sales Associate"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>
      </div>

      <div className="actions">
        <button className="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button className="secondary" onClick={handleReset} type="button">Reset</button>
        {saved && <span className="saved-hint">Saved.</span>}
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


function NotificationSettings({ user }: { user: EmployeeUserType }) {
  const [preference, setPreference] = useState<"In-App" | "E-mail">(user.notifPreference ?? "In-App");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPreference(user.notifPreference ?? "In-App");
  }, [user.notifPreference]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateDoc(doc(db, "users", user.uid), { notifPreference: preference });
      setSaved(true);
    } catch (e) {
      console.error("Failed to save notification settings:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="notifications-section">
      <h3 className="section-title">Notification Preferences</h3>
      <p className="section-subtitle">
        Choose how you want to receive updates and alerts.
      </p>

      <div className="notification-list">
        <div className="notification-item">
          <div>
            <h4>In-App notifications</h4>
            <p>Receive updates within the app</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={preference === "In-App"}
              onChange={() => setPreference("In-App")}
            />
            <span className="slider" />
          </label>
        </div>

        <div className="notification-item">
          <div>
            <h4>Email notifications</h4>
            <p>Receive important updates via email</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={preference === "E-mail"}
              onChange={() => setPreference("E-mail")}
            />
            <span className="slider" />
          </label>
        </div>
      </div>

      <div className="actions">
        <button className="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Preferences"}
        </button>
        {saved && <span className="saved-hint">Saved.</span>}
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

