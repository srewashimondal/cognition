import { useState, useEffect, useRef } from "react";
import "./Settings.css";
import eye_on from '../../../assets/icons/eye_on.svg';
import eye_off from '../../../assets/icons/eye_off.svg';
import default_icon from '../../../assets/icons/default-icon.svg';
import icon_stroke from '../../../assets/icons/icon-stroke.svg';
import add_cta from '../../../assets/icons/add-cta.svg';
import { Tooltip, Select } from "@radix-ui/themes";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import type { EmployerUserType } from "../../../types/User/UserType";
import type { WorkspaceType } from "../../../types/User/WorkspaceType";
import { getInterfacePrefs, saveInterfacePrefs, applyInterfacePrefs } from "../../../utils/interfacePrefs";

type Tab = "account" | "notifications" | "interface" | "payments" | "workspace";

type SettingsProps = {
  user: EmployerUserType;
  workspace: WorkspaceType | null;
};

export default function Settings({ user, workspace }: SettingsProps) {
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
      {activeTab === "account" && <AccountSettings user={user} />}
      {activeTab === "workspace" && <WorkspaceSettings workspace={workspace} />}
      {/*activeTab === "security" && <SecuritySettings />*/}
      {activeTab === "notifications" && <NotificationSettings user={user} />}
      {activeTab === "interface" && <InterfaceSettings user={user} />}
      {activeTab === "payments" && <PaymentsSettings />}
      
    </div>
  );
}

function AccountSettings({ user }: { user: EmployerUserType }) {
  const [fullName, setFullName] = useState(user.fullName ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFullName(user.fullName ?? "");
    setEmail(user.email ?? "");
  }, [user.fullName, user.email]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        fullName: fullName.trim(),
        email: email.trim(),
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


function NotificationSettings({ user }: { user: EmployerUserType }) {
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


function InterfaceSettings({ user }: { user: EmployerUserType }) {
  const [prefs, setPrefs] = useState(() => getInterfacePrefs(user.uid));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    applyInterfacePrefs(prefs);
  }, [prefs]);

  const updatePref = <K extends keyof typeof prefs>(key: K, value: typeof prefs[K]) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    saveInterfacePrefs({ ...prefs, [key]: value }, user.uid);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="interface-section">
      <h3 className="section-title">Readability &amp; display</h3>
      <p className="section-subtitle">
        Adjust text size and spacing for easier reading. Changes apply immediately across the app.
      </p>

      <div className="interface-card">
        {/* Text size */}
        <div className="interface-row">
          <div>
            <h4>Text size</h4>
            <p>Base font size for the app (12–24px)</p>
          </div>
          <div className="slider-with-value">
            <input
              type="range"
              min={12}
              max={24}
              value={prefs.fontSize}
              onChange={(e) => updatePref("fontSize", Number(e.target.value))}
            />
            <span className="slider-value">{prefs.fontSize}px</span>
          </div>
        </div>

        {/* Line spacing */}
        <div className="interface-row">
          <div>
            <h4>Line spacing</h4>
            <p>Space between lines (1.2–2.5)</p>
          </div>
          <div className="slider-with-value">
            <input
              type="range"
              min={1.2}
              max={2.5}
              step={0.1}
              value={prefs.lineSpacing}
              onChange={(e) => updatePref("lineSpacing", Number(e.target.value))}
            />
            <span className="slider-value">{prefs.lineSpacing}</span>
          </div>
        </div>

        {/* Theme */}
        <div className="interface-row">
          <div>
            <h4>Theme</h4>
            <p>Light or dark interface</p>
          </div>
          <div className="theme-toggle">
            <button
              className={prefs.theme === "light" ? "active light" : "light"}
              onClick={() => updatePref("theme", "light")}
            >
              ☀ Light
            </button>
            <button
              className={prefs.theme === "dark" ? "active dark" : "dark"}
              onClick={() => updatePref("theme", "dark")}
            >
              🌙 Dark
            </button>
          </div>
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
              checked={prefs.reducedMotion}
              onChange={() => updatePref("reducedMotion", !prefs.reducedMotion)}
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
              checked={prefs.focusMode}
              onChange={() => updatePref("focusMode", !prefs.focusMode)}
            />
            <span className="slider" />
          </label>
        </div>
      </div>

      <div className="actions">
        {saved && <span className="saved-hint">Preferences saved. They apply across the app.</span>}
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

function WorkspaceSettings({ workspace }: { workspace: WorkspaceType | null }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedPFP, setUploadedPFP] = useState<string | File>(workspace?.icon ?? "");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [workspaceTitle, setWorkspaceTitle] = useState(workspace?.name ?? "");
  const [storeTitle, setStoreTitle] = useState(workspace?.store?.storeName ?? "");
  const [category, setCategory] = useState(workspace?.store?.category ?? "General Retail");
  const [format, setFormat] = useState(workspace?.store?.storeFormat ?? "Standalone Store");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!workspace) return;
    setWorkspaceTitle(workspace.name ?? "");
    setStoreTitle(workspace.store?.storeName ?? "");
    setCategory(workspace.store?.category ?? "General Retail");
    setFormat(workspace.store?.storeFormat ?? "Standalone Store");
    setUploadedPFP(workspace.icon ?? "");
  }, [workspace]);

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

  const handleSaveWorkspace = async () => {
    if (!workspace) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateDoc(doc(db, "workspaces", workspace.id), { name: workspaceTitle.trim() });
      setSaved(true);
    } catch (e) {
      console.error("Failed to save workspace:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStore = async () => {
    if (!workspace?.storeID) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateDoc(workspace.storeID, {
        storeName: storeTitle.trim(),
        category,
        storeFormat: format,
      });
      setSaved(true);
    } catch (e) {
      console.error("Failed to save store:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!workspace) return;
    setWorkspaceTitle(workspace.name ?? "");
    setStoreTitle(workspace.store?.storeName ?? "");
    setCategory(workspace.store?.category ?? "General Retail");
    setFormat(workspace.store?.storeFormat ?? "Standalone Store");
  };

  if (!workspace) {
    return (
      <div className="workspace-settings">
        <p className="muted">No workspace loaded. Your workspace data will appear here when available.</p>
      </div>
    );
  }

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
            <button className="primary" onClick={handleSaveWorkspace} disabled={saving}>
              {saving ? "Saving..." : "Save workspace"}
            </button>
            <button className="secondary" onClick={handleReset} type="button">Reset</button>
            {saved && <span className="saved-hint">Saved.</span>}
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
              <button className="primary" onClick={handleSaveStore} disabled={saving}>
                {saving ? "Saving..." : "Save store"}
              </button>
              <button className="secondary" onClick={handleReset} type="button">Reset</button>
              {saved && <span className="saved-hint">Saved.</span>}
            </div>

          </div>
        </div>
    </div>
  );
}
