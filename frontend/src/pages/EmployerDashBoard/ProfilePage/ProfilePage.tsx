import { useState, useEffect, useRef } from "react";
import "./ProfilePage.css";
import { Tooltip } from "@radix-ui/themes";
import type { EmployeeUserType, EmployerUserType } from "../../../types/User/UserType";
import ErrorMessage from "../../../components/ErrorMessage/ErrorMessage";
import default_icon from '../../../assets/icons/default-icon.svg';
import icon_stroke from '../../../assets/icons/icon-stroke.svg';
import add_cta from '../../../assets/icons/add-cta.svg';
import wavy_check from '../../../assets/icons/wavy-check-icon.svg';
import trophy_icon from '../../../assets/icons/badges/black-medal-icon-2.svg';
import right_chevron from '../../../assets/icons/chevron-right-icon.svg';
import log_out_icon from '../../../assets/icons/log-out-icon.svg';
import edit_icon from '../../../assets/icons/white-edit-icon.svg';
import check_icon from '../../../assets/icons/white-check.svg';
import calendar_icon from '../../../assets/icons/black-calendar-check-icon.svg'
import clock_icon from '../../../assets/icons/clock-icon.svg';
import notebook_icon from '../../../assets/icons/form-icon.svg';
import star_icon from '../../../assets/icons/badges/star-icon.svg';
import bolt_icon from '../../../assets/icons/badges/bolt-icon.svg';
import map_icon from '../../../assets/icons/badges/map-icon.svg';

interface ProfilePageProps {
  open: boolean;
  onClose: () => void;
  user: EmployeeUserType | EmployerUserType;
  viewer: Record<string, string>; // change to EmployeeUserType | EmployerUserType later
  tempPfp?: string; // remove later
}

type Tab = "Progress" | "Modules" | "Badges";

export default function ProfilePage({ open, onClose, user, viewer, tempPfp }: ProfilePageProps) {
  const isOwnProfile = user.role === "employee" ? user.employeeID === viewer.id : user.employerID === viewer.id;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const DEFAULT_PFP = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
  const [uploadedPFP, setUploadedPFP] = useState<string | File>(
    tempPfp ?? user.profilePicture ?? DEFAULT_PFP
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [currentTab, setCurrentTab] = useState<Tab>("Progress");
  const [displayName, setDisplayName] = useState(user.fullName ?? "");
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setDisplayName(user.fullName ?? "");
  }, [user.fullName]);


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

  const handleSave = () => {
    if (editMode === false) {
      setEditMode(true);
      return;
    }

    if (!displayName.trim()) {
      setError("Display name field cannot be empty");
      return;
    }

    setEditMode(false);
    setError(null);
  };

  const colorByScore = (score: number) => {
    if (score > 89) {
      return "green";
    }

    if (score < 89 && score > 79) {
      return "blue"
    }

    if (score < 79 && score > 59) {
      return "orange"
    }

    if (score < 59) {
      return "red"
    }
  };

  const iconByBadge = {
    "star": star_icon,
    "bolt": bolt_icon,
    "map": map_icon
  };

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
            {isOwnProfile ? 
              <Tooltip content={editMode ? "Save edits" : "Edit profile"}>
                <div className="builder-action close-btn" onClick={handleSave}>
                  <img src={editMode ? check_icon : edit_icon} />
                </div>
              </Tooltip>
              : <div /> }
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
                  <input className="display-name-input" type="text" placeholder="Enter new display name" value={displayName} 
                  onChange={(e) => {setDisplayName(e.target.value); 
                    if (error && e.target.value.trim()) { setError(null); }}} />
                  {error && <ErrorMessage message={error} />}
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
                <div className="progress-item top" onClick={() => setCurrentTab("Modules")}>
                  <div className="progress-item-left">
                    <img src={wavy_check}/>
                    <div className="progress-item-name">
                      <h3>{user.completedModules.length}</h3>
                      <p>module{user.completedModules.length !== 1 ? "s" : ""} completed</p>
                    </div>
                  </div>
                  <img src={right_chevron} />
                </div>
                <div className="progress-item bottom" onClick={() => setCurrentTab("Badges")}>
                  <div className="progress-item-left">
                    <img src={trophy_icon}/>
                    <div className="progress-item-name">
                      <h3>{user.achievements.length}</h3>
                      <p>badge{user.achievements.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <img src={right_chevron} />
                </div>
              </div>
            </>
          }

          { (currentTab === "Modules") &&
            <>
              <div className="tab-title">
                <img src={right_chevron} onClick={() => setCurrentTab("Progress")}/>
                <h4>Modules</h4>
              </div>
              <div className="progress-list"> 
                {user.completedModules.map((m) => 
                <div className="completed-module-item">
                  <div className="completed-module-item-left">
                    <div className="completed-module-item-name">
                      <h4>{m.moduleInfo.title}</h4>
                    </div>
                    <div className="completed-module-item-meta">
                      <div className="completed-module-item-meta-item">
                        <img src={calendar_icon} />
                        Completed {m.completionDate}
                      </div>
                      <div className="completed-module-item-meta-item">
                        <img src={clock_icon} />
                        <p>{m.moduleInfo.hours} hours • </p>
                        <img src={notebook_icon} />
                        <p>{m.moduleInfo.lessons?.length} lesson{m.moduleInfo.lessons?.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  </div>
                  <div className={`completed-module-item-score ${colorByScore(m.score ?? 0)}`} style={{ "--percent": m.score } as React.CSSProperties}>
                      <p>{m.score}</p>
                  </div>
                </div>
                )}
              </div>
            </>
          }

          { (currentTab === "Badges") &&
            <>
              <div className="tab-title">
                <img src={right_chevron} onClick={() => setCurrentTab("Progress")}/>
                <h4>Achievements</h4>
              </div>
              <div className="progress-list">
                {user.achievements.map((a) => 
                  <div className="badge-item">
                    <img src={iconByBadge[a.icon]} />
                    <div className="badge-item-name">
                      <h4>{a.name}</h4>
                      <p>{a.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          }
        </section>}

        { (user.role === "employee") &&
          <>
          </>
        }

        {/* Actions */}
        { isOwnProfile && 
        <section className="profile-actions">
            <button className="drawer-btn danger">
              Log out
              <span>
                <img src={log_out_icon}/>
              </span>
            </button>
          </section>}
      </aside>
    </>
  );
}
