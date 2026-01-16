import { useState, useEffect, useRef } from "react";
import "./ProfilePage.css";
import default_icon from '../../../assets/icons/default-icon.svg';
import icon_stroke from '../../../assets/icons/icon-stroke.svg';
import add_cta from '../../../assets/icons/add-cta.svg';

interface ProfilePageProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfilePage({ open, onClose }: ProfilePageProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedPFP, setUploadedPFP] = useState<string | File>("https://i.etsystatic.com/30289585/r/il/3f982c/4322819070/il_fullxfull.4322819070_tn35.jpg");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "auto";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="drawer-backdrop" onClick={onClose} />

      {/* Drawer */}
      <aside className="profile-drawer" role="dialog" aria-modal="true">
        {/* Header */}
        <header className="drawer-header">
          <h3>Profile</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </header>

        {/* Profile top */}
        <section className="profile-hero">
          {/*
          <div className="avatar-wrapper">
            <img
              src="https://i.etsystatic.com/30289585/r/il/3f982c/4322819070/il_fullxfull.4322819070_tn35.jpg"
              alt="Profile avatar"
              className="profile-avatar"
            />
            <button className="change-avatar">Change</button>
          </div>*/}

          {(imagePreview || uploadedPFP) ? 
          (<div className="avatar-wrapper pfp-upload-container">
            <img src={displayIcon} className="uploaded-image"/>
            <img src={icon_stroke} className="img-frame"/>
            <img src={add_cta} className="pfp-add" onClick={() => fileInputRef.current?.click()}/>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => {const file = e.target.files?.[0]; if (file) setUploadedPFP(file);}}/>
          </div>) :
          (<div className="pfp-upload">
              <img src={default_icon} className="pfp-base"/>
              <img src={add_cta} className="pfp-add" onClick={() => fileInputRef.current?.click()}/>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => {const file = e.target.files?.[0]; if (file) setUploadedPFP(file);}}/>
          </div>)}

          <h4>Harsh</h4>
          <p className="role">Employer Admin</p>
        </section>

        {/* Info fields */}
        <section className="profile-info">
          <div className="info-item">
            <span className="label">Username</span>
            <span className="value">@harsh_admin</span>
          </div>

          <div className="info-item">
            <span className="label">Email</span>
            <span className="value">harsh@cognition.ai</span>
          </div>

          <div className="info-item">
            <span className="label">Phone</span>
            <span className="value">+1 (646) 555-0198</span>
          </div>
        </section>

        {/* Actions */}
        <section className="profile-actions">
          <button className="drawer-btn primary">Edit Profile</button>
          <button className="drawer-btn">Account Settings</button>
          <button className="drawer-btn danger">Log out</button>
        </section>
      </aside>
    </>
  );
}
