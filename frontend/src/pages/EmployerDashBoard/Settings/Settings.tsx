import { useState, useEffect, useRef } from "react";
import "./Settings.css";
import eye_on from '../../../assets/icons/eye_on.svg';
import eye_off from '../../../assets/icons/eye_off.svg';
import default_icon from '../../../assets/icons/default-icon.svg';
import icon_stroke from '../../../assets/icons/icon-stroke.svg';
import add_cta from '../../../assets/icons/add-cta.svg';
import { workspace } from "../../../dummy_data/workspace_data";
import { Tooltip, Select } from "@radix-ui/themes";

type Tab = "account" | "notifications" | "interface" | "payments" | "workspace";

export default function Settings() {
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
          Account Settings
        </span>

        <span
          className={activeTab === "workspace" ? "active" : ""}
          onClick={() => setActiveTab("workspace")}
        >
          Workspace Settings
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

        <span
          className={activeTab === "payments" ? "active" : ""}
          onClick={() => setActiveTab("payments")}
        >
          Payments
        </span>
      </div>


      {/* CONTENT */}
      {activeTab === "account" && <AccountSettings />}
      {activeTab === "workspace" && <WorkspaceSettings />}
      {/*activeTab === "security" && <SecuritySettings />*/}
      {activeTab === "notifications" && <NotificationSettings />}
      {activeTab === "interface" && <InterfaceSettings />}
      {activeTab === "payments" && <PaymentsSettings />}
      
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

        {/*<div>
          <label>Username</label>
          <input placeholder="Please enter your username" />
        </div>

        <div>
          <label>Phone number</label>
          <input placeholder="Please enter your phone number" />
        </div>*/}
      </div>

      {/*<div className="bio-section">
        <label>Bio</label>
        <textarea placeholder="Write your Bio here e.g your hobbies, interests ETC" />
      </div>*/}

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
          <span className="eye" onClick={() => setViewCurrentPassword(prev => !prev)} >
            <img src={viewCurrentPassword ? eye_on : eye_off} />
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


function PaymentsSettings() {
  const [autoPayout, setAutoPayout] = useState(true);
  const [notifyPayments, setNotifyPayments] = useState(true);
  const [editing, setEditing] = useState(false);

  const [card, setCard] = useState({
    brand: "VISA",
    last4: "1978",
    name: "Harsh",
    country: "United States",
  });

  const [form, setForm] = useState({
    number: "",
    name: "",
    country: "United States",
  });

  const savePayment = () => {
    if (!form.number || !form.name) return;

    setCard({
      brand: "VISA",
      last4: form.number.slice(-4),
      name: form.name,
      country: form.country,
    });

    setForm({ number: "", name: "", country: "United States" });
    setEditing(false);
  };

  return (
    <div className="payments-section">
      <h3 className="section-title">Payments</h3>
      <p className="section-subtitle">
        Manage payouts and payment methods for your account.
      </p>

      {/* Rounded container */}
      <div className="payments-container">
        {/* Toggles */}
        <div className="toggle-row">
          <div>
            <strong>Enable Auto Payout</strong>
            <p>Auto payout occurs at the end of each month.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={autoPayout}
              onChange={() => setAutoPayout(!autoPayout)}
            />
            <span className="slider" />
          </label>
        </div>

        <div className="toggle-row">
          <div>
            <strong>Notify New Payments</strong>
            <p>You’ll be notified when a payment has been made.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={notifyPayments}
              onChange={() => setNotifyPayments(!notifyPayments)}
            />
            <span className="slider" />
          </label>
        </div>

        <hr />

        {/* Saved card */}
        {!editing ? (
          <>
            <div className="payment-card">
              <div>
                <strong>
                  {card.brand} •••• {card.last4}
                </strong>
                <p>
                  {card.name} · {card.country}
                </p>
              </div>

              <button className="secondary" onClick={() => setEditing(true)}>
                Update
              </button>
            </div>

            <button
              className="ghost-btn"
              onClick={() => setEditing(true)}
            >
              + Add another payment method
            </button>
          </>
        ) : (
          <>
            {/* Add / Update form */}
            <div className="form-grid">
              <div>
                <label>Card number</label>
                <input
                  placeholder="1234 5678 9012 3456"
                  value={form.number}
                  onChange={(e) =>
                    setForm({ ...form, number: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Cardholder name</label>
                <input
                  placeholder="Name on card"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Country</label>
                <select
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                >
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>India</option>
                </select>
              </div>
            </div>

            <div className="inline-actions">
              <button className="primary" onClick={savePayment}>
                Save payment method
              </button>
              <button
                className="secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function WorkspaceSettings() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedPFP, setUploadedPFP] = useState<string | File>(workspace.icon ?? "");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [workspaceTitle, setWorkspaceTitle] = useState(workspace.name);
  const [storeTitle, setStoreTitle] = useState(workspace.store.storeName);
  const [category, setCategory] = useState(workspace.store.category);
  const [format, setFormat] = useState(workspace.store.storeFormat);

  useEffect(() => {
    if (typeof uploadedPFP === "string") {
        setImagePreview(null);
        return;
    }
    const url = URL.createObjectURL(uploadedPFP);
    setImagePreview(url);

    return () => URL.revokeObjectURL(url);
  }, [uploadedPFP]);
  const displayIcon = imagePreview ?? (typeof uploadedPFP === "string" ? uploadedPFP : undefined);

  const storeCategories = ["Beauty & Cosmetics", "Drugstore & Pharmacy","General Retail", "Electronics & Tech", "Apparel & Fashion", "Specialty Retail", "Home Goods", "Grocery", "Sporting Goods & Hobbies"];
  type storeCategory = "Beauty & Cosmetics" | "Drugstore & Pharmacy"| "General Retail" | "Electronics & Tech" | "Apparel & Fashion" | "Specialty Retail" | "Home Goods" | "Grocery" | "Sporting Goods & Hobbies";

  const storeFormats = ["Standalone Store", "Mall Location", "Department Store Section"];
  type storeFormat = "Standalone Store" | "Mall Location" | "Department Store Section";

  return (
    <div className="workspace-settings">
      <h3 className="security-title">Workspace Information</h3>
      <div className="form-grid workspace">
        <label>Workspace Icon</label>
        {(imagePreview || uploadedPFP) ? 
          (<div className="avatar-wrapper pfp-upload-container">
            <img src={displayIcon} className="uploaded-image"/>
            <img src={icon_stroke} className="img-frame"/>
            <Tooltip content="Update profile picture">
                <img src={add_cta} className="pfp-add" onClick={() => fileInputRef.current?.click()}/>
            </Tooltip>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => {const file = e.target.files?.[0]; if (file) setUploadedPFP(file);}}/>
          </div>) :
          (<div className="pfp-upload">
              <img src={default_icon} className="pfp-base"/>
              <Tooltip content="Update workspace icon">
                  <img src={add_cta} className="pfp-add" onClick={() => fileInputRef.current?.click()}/>
              </Tooltip>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => {const file = e.target.files?.[0]; if (file) setUploadedPFP(file);}}/>
          </div>)}
          
          <div>
            <label>Workspace Name</label>
            <input placeholder="Update workspace name" type="text" value={workspaceTitle} onChange={(e) => setWorkspaceTitle(e.target.value)} />
          </div>

          <div className="actions workspace">
            <button className="primary">Save Changes</button>
            <button className="secondary">Reset</button>
          </div>
        </div>
        <div className="store-info-wrapper">
          <h3 className="security-title">Store Information</h3>
          <div className="form-grid workspace">
            <div>
              <label>Store Name</label>
              <input placeholder="Update store name" type="text" value={storeTitle} onChange={(e) => setStoreTitle(e.target.value)} />
            </div>
            <div>
              <div className="form-grid-select-item">
                <label>Store Category</label>
                <Select.Root defaultValue={category} value={category} onValueChange={(c: storeCategory) => setCategory(c)}>
                  <Select.Trigger />
                  <Select.Content color="orange">
                    {storeCategories.map(c => 
                      <Select.Item key={c} value={c} >{c}</Select.Item>
                    )}
                  </Select.Content>
                </Select.Root>
              </div>
              <div className="form-grid-select-item">
                <label>Store Format</label>
                <Select.Root defaultValue={format} value={format} onValueChange={(c: storeFormat) => setFormat(c)}>
                  <Select.Trigger />
                  <Select.Content color="orange">
                    {storeFormats.map(c => 
                      <Select.Item key={c} value={c} >{c}</Select.Item>
                    )}
                  </Select.Content>
                </Select.Root>
              </div>
            </div>

            <div className="actions workspace">
              <button className="primary">Save Changes</button>
              <button className="secondary">Reset</button>
            </div>

          </div>
        </div>
    </div>
  );
}
