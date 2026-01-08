import "./Settings.css";
import { useRef } from "react";

export default function Settings() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Selected file:", file);
    }
  };
  return (
    <div className="settings-page">
      {/* Tabs */}
      <div className="settings-tabs">
        <span className="active">Account Setting</span>
        <span>Login & Security</span>
        <span>Notifications</span>
        <span>Interface</span>
      </div>

      {/* Profile Picture */}
      <div className="profile-section">
        <p className="section-label">Your Profile Picture</p>
        <div className="avatar-upload">
          <div className="avatar-box" onClick={handleAvatarClick}>
          <span className="upload-icon">📷</span>
          <p>Upload your photo</p>
        </div>
        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        </div>
      </div>

      <hr />

      {/* Form */}
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
          <div className="phone-input">
            <input placeholder="Please enter your phone number" />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="bio-section">
        <label>Bio</label>
        <textarea placeholder="Write your Bio here e.g your hobbies, interests ETC" />
      </div>

      {/* Actions */}
      <div className="actions">
        <button className="primary">Update Profile</button>
        <button className="secondary">Reset</button>
      </div>
    </div>
  );
}
