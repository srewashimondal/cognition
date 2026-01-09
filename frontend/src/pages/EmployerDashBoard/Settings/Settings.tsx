import { useState } from "react";
import "./Settings.css";

type Tab = "account" | "security" | "notifications" | "interface";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>("account");

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

        <span
          className={activeTab === "security" ? "active" : ""}
          onClick={() => setActiveTab("security")}
        >
          Login & Security
        </span>

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
      {activeTab === "security" && <SecuritySettings />}
      {activeTab === "notifications" && <NotificationSettings />}
      {activeTab === "interface" && <InterfaceSettings />}
    </div>
  );
}

function AccountSettings() {
  return (
    <>
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
        <button className="primary">Update Profile</button>
        <button className="secondary">Reset</button>
      </div>
    </>
  );
}

function SecuritySettings() {
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
          <input type="password" placeholder="••••••••" />
          <span className="eye">👁</span>
        </div>

        <div className="password-field">
          <label>New password</label>
          <input type="password" placeholder="Enter new password" />
          <span className="eye">👁</span>
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
  return (
    <div className="settings-section">
      <h3>Interface Preferences</h3>

      <label>
        Theme
        <select>
          <option>Light</option>
          <option>Dark</option>
        </select>
      </label>

      <div className="actions">
        <button className="primary">Save Settings</button>
      </div>
    </div>
  );
}

