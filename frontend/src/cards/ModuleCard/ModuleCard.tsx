import './ModuleCard.css'
import clock_icon from '../../assets/icons/clock-icon.svg';
import form_icon from '../../assets/icons/form-icon.svg';
import white_rocket from '../../assets/icons/white-rocket-icon.svg';
import orange_rocket from '../../assets/icons/orange-rocket-icon.svg';
import black_edit from '../../assets/icons/black-edit-icon.svg';
import orange_edit from '../../assets/icons/orange-edit-icon.svg';

type ModuleProp = {
    moduleInfo: Record<string, any>;
};

export default function ModuleCard({ moduleInfo }: ModuleProp) {
    const bannerColorByID = ["yellow", "pink", "blue", "green", "red", "orange"];
    return (
        <div key={moduleInfo.id} className="module-card">
            <div className="card-top">
              <div className={`banner ${bannerColorByID[moduleInfo.id - 1]}`} >
                <button className="edit-btn">
                  <div className="edit-swap">
                    <img className="edit-icon default" src={black_edit} />
                    <img className="edit-icon hover" src={orange_edit} />
                  </div>
                  <span>Edit</span>
                </button>
              </div>
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
                  <span>{moduleInfo.hours}</span>
                </span>
                <span className="meta-item">
                  <span className="meta-icon">
                    <img src={form_icon} />
                  </span>
                  <span>{moduleInfo.lessons}</span>
                </span>
              </div>

              <button className={`deploy-btn ${(moduleInfo.deployed) ? "deployed" : ""}`}>
                {(!moduleInfo.deployed) ? (<span className="deployed-label-div">
                  <div className="rocket-swap">
                    <img className="rocket-icon default" src={white_rocket}/>
                    <img className="rocket-icon hover" src={orange_rocket}/>
                  </div>
                  <span>Deploy</span>
                </span>) : ("Deployed")}
              </button>
            </div>
        </div>
    );
}