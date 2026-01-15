import './ModuleCard.css'
import { useNavigate } from 'react-router-dom';
import type { ModuleType } from '../../types/Modules/ModuleType';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import clock_icon from '../../assets/icons/clock-icon.svg';
import form_icon from '../../assets/icons/form-icon.svg';
import white_rocket from '../../assets/icons/white-rocket-icon.svg';
import orange_rocket from '../../assets/icons/orange-rocket-icon.svg';
import white_play from '../../assets/icons/white-hollow-play-icon.svg';
import orange_play from '../../assets/icons/orange-hollow-play-icon.svg';
import black_edit from '../../assets/icons/black-edit-icon.svg';
import orange_edit from '../../assets/icons/orange-edit-icon.svg';

type ModuleProp = {
    moduleInfo: ModuleType;
    role: "employer" | "employee";
    status?: "not begun" | "started" | "completed";
    percent?: number;
    style?: boolean;
};

export default function ModuleCard({ moduleInfo, role, status, percent, style }: ModuleProp) {
    const navigate = useNavigate();
    const bannerColorByID = ["module1", "module2", "module3", "module4", "module5", "module6"];
    return (
        <div key={moduleInfo.id} className="module-card">
            <div className="card-top">
              <div className={`banner ${bannerColorByID[moduleInfo.id - 1]}`} >
                {(role === "employer") &&
                <button className="edit-btn" onClick={() => navigate(`/employer/modules/${moduleInfo.id}`)}>
                  <div className="edit-swap">
                    <img className="edit-icon default" src={black_edit} />
                    <img className="edit-icon hover" src={orange_edit} />
                  </div>
                  <span>Edit</span>
                </button>}
              </div>
              <div className="card-content">
              {/*<span className="subtitle">{moduleInfo.subtitle}</span>
              <p className="desc">{moduleInfo.description}</p>*/}
              <h3>{moduleInfo.title}</h3>

              <div className="meta-div">
                <span className="meta-item">
                  <span className="meta-icon">
                    <img src={clock_icon} />
                  </span>
                  <span>{`${moduleInfo.hours}hrs`}</span>
                </span>
                <span className="meta-item">
                  <span className="meta-icon">
                    <img src={form_icon} />
                  </span>
                  <span>{`0${moduleInfo.numLessons} Lessons`}</span>
                </span>
              </div>
            </div>
        </div>
            <div className="module-card-bottom">
                { (role === "employer") ? (
                <button className={`module-card-btn ${(moduleInfo.deployed) ? "deployed" : ""}`}>
                  {(!moduleInfo.deployed) ? (
                    <span className="module-card-btn-label-div">
                    <div className="module-action-swap">
                      <img className="module-action-icon default" src={white_rocket}/>
                      <img className="module-action-icon hover" src={orange_rocket}/>
                    </div>
                    <span>Deploy</span>
                  </span>) : ("Deployed")}
                </button> ) : (
                <button className={`module-card-btn ${(moduleInfo.deployed) ? "deployed" : ""}`}>
                  {(status !== "completed") ? (<span className="module-card-btn-label-div">
                    <div className="module-action-swap">
                      <img className="module-action-icon default" src={white_play}/>
                      <img className="module-action-icon hover" src={orange_play}/>
                    </div>
                    <span>{(status === "not begun") ? "Begin" : "Continue"}</span>
                  </span>) : ("View Module Performance")}
                </button>
              )}
              {(role === "employee" && status === "started" && percent) && (<ProgressBar percent={percent} style={style} />)}
              </div>
        </div>
    );
}