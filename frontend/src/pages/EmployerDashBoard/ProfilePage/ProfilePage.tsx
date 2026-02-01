import { useState, useEffect, useRef } from "react";
import "./ProfilePage.css";
import { Tooltip } from "@radix-ui/themes";
import type { EmployeeUserType, EmployerUserType } from "../../../types/User/UserType";
import default_icon from '../../../assets/icons/default-icon.svg';
import icon_stroke from '../../../assets/icons/icon-stroke.svg';
import add_cta from '../../../assets/icons/add-cta.svg';
import wavy_check from '../../../assets/icons/wavy-check-icon.svg';
import trophy_icon from '../../../assets/icons/trophy-icon.svg';
import right_chevron from '../../../assets/icons/chevron-right-icon.svg';
import log_out_icon from '../../../assets/icons/log-out-icon.svg';
import edit_icon from '../../../assets/icons/white-edit-icon.svg';
import check_icon from '../../../assets/icons/white-check.svg';

interface ProfilePageProps {
  open: boolean;
  onClose: () => void;
  user: EmployeeUserType | EmployerUserType;
}

type Tab = "Progress" | "Modules" | "Badges";

export default function ProfilePage({ open, onClose, user }: ProfilePageProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedPFP, setUploadedPFP] = useState<string | File>(user.profilePicture);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [currentTab, setCurrentTab] = useState<Tab>("Progress");
  const [displayName, setDisplayName] = useState(user.fullName);

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
        {/* Profile top */}

        <div className="profile-hero">
          {/*
          <div className="avatar-wrapper">
            <img
              src="https://i.etsystatic.com/30289585/r/il/3f982c/4322819070/il_fullxfull.4322819070_tn35.jpg"
              alt="Profile avatar"
              className="profile-avatar"
            />
            <button className="change-avatar">Change</button>
          </div>*/}

          <header className="drawer-header">
            <Tooltip content="Edit profile">
              <div className="builder-action close-btn" onClick={() => setEditMode(prev => !prev)}>
                <img src={editMode ? check_icon : edit_icon} />
              </div>
            </Tooltip>
            <button className="close-btn" onClick={onClose}>✕</button>
          </header>

          <div className="profile-hero-top">
            {(imagePreview || uploadedPFP) ? 
            (<div className="avatar-wrapper pfp-upload-container">
              <img src={displayIcon} className="uploaded-image"/>
              <img src={icon_stroke} className="img-frame"/>
              { (editMode) &&
                <Tooltip content="Update profile picture">
                  <img src={add_cta} className="pfp-add" onClick={() => fileInputRef.current?.click()}/>
                </Tooltip>
              }
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => {const file = e.target.files?.[0]; if (file) setUploadedPFP(file);}}/>
            </div>) :
            (<div className="pfp-upload">
                <img src={default_icon} className="pfp-base"/>
                { (editMode) &&
                  <Tooltip content="Update profile picture">
                    <img src={add_cta} className="pfp-add" onClick={() => fileInputRef.current?.click()}/>
                  </Tooltip>
                }
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => {const file = e.target.files?.[0]; if (file) setUploadedPFP(file);}}/>
            </div>)}
            <div className="profile-hero-name">
              { editMode ?
                <div className="display-name-input-wrapper">
                  <input className="display-name-input" type="text" placeholder="Enter new display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                : <h3>{displayName}</h3>}
              <p>{user.jobTitle}</p>
            </div>
          </div>

          <div className="profile-hero-bottom">
            <p>Joined {user.joinDate}</p>
            <p>{user.role === "employee" && `${user.averageScore}% Average Score • ${user.totalHours} hour${user.totalHours !== 1 ? "s" : ""} of training`}</p>
          </div>
        </div>

        {/* Info fields */}
        {(user.role === "employee") &&
        <section className="profile-info">

          { (currentTab === "Progress") && 
            <>
              <h4>Progress</h4>
              <div className="progress-wrapper">
                <div className="progress-item top">
                  <div className="progress-item-left">
                    <img src={wavy_check}/>
                    <div className="progress-item-name">
                      <h3>{user.completedModules.length}</h3>
                      <p>module{user.completedModules.length !== 1 ? "s" : ""} completed</p>
                    </div>
                  </div>
                  <img src={right_chevron} />
                </div>
                <div className="progress-item bottom">
                  <div className="progress-item-left">
                    <img src={trophy_icon}/>
                    <div className="progress-item-name">
                      <h3>{user.achievements.length}</h3>
                      <p>achievement{user.achievements.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <img src={right_chevron} />
                </div>
              </div>
            </>
          }
        </section>}

        {/* Actions */}
        <section className="profile-actions">
          <button className="drawer-btn danger">
            Log out
            <span>
              <img src={log_out_icon}/>
            </span>
          </button>
        </section>
      </aside>
    </>
  );
}
