import "./Modules.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@radix-ui/themes";
import { modules } from '../../../dummy_data/modules_data.tsx';
import { standardModule } from "../../../dummy_data/standard_data.tsx";
import ModuleCard from '../../../cards/ModuleCard/ModuleCard.tsx';
import add_cta from '../../../assets/icons/add-cta.svg';

type Tab = "simulations" | "standard";

export default function Modules() {
  const navigate = useNavigate();
  const [addSelected, setAddSelected] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("simulations");

  return (
    <div className="modules-page">
      {/* Header */}
      <div className="modules-header mod">
        <div>
          <h1>Modules Catalog</h1>
          <p>Access and review past training sessions</p>
        </div>
      </div>

      <div className="modules-tab-wrapper">
        <div className="modules-tab">
          <span className={`module-tab ${activeTab === "simulations" ? "active" : ""}`}
            onClick={() => setActiveTab("simulations")}>
            SIMULATION MODULES
          </span>
          <span className={`module-tab ${activeTab === "standard" ? "active" : ""}`}
            onClick={() => setActiveTab("standard")}>
            STANDARD MODULES
          </span>
        </div>
      </div>

      {/* Grid */}
      { (activeTab === "simulations") ?
        <div className="modules-grid">
          {modules.map((m) => (<ModuleCard moduleInfo={m} type={"simulation"} role={"employer"} />))}
        </div> :
        <div className="modules-grid">
          {standardModule.map((m) => (<ModuleCard moduleInfo={m} type={"standard"} role={"employer"} />))}
        </div>
      }
      {/* Pagination  
      <div className="pagination">
        <button disabled>{"<"}</button>
        <button className="active">1</button>
        <button>{">"}</button>
      </div>
      */}

      {/* Floating Add Button */}
      <>
        {addSelected && <div className="drawer-backdrop module" onClick={() => setAddSelected(false)} />}
        <div className="fab-wrapper">
          { addSelected && (
              <div className="fab-options">
                <div className="fab-option" onClick={() => navigate(`/employer/modules/builder`)}>New Simulation Module</div>
                <div className="fab-option" onClick={() => navigate(`/employer/modules/standard-builder`)}>New Standard Module</div>
                <div className="fab-options-line" />
              </div>
            )
          }
          <Tooltip content={addSelected ? "Exit create" : "Create new module"}>
            <button className={`fab ${addSelected ? "selected" : ""}`} onClick={() => setAddSelected(prev => !prev)}>
              <img src={add_cta}/>
            </button>
          </Tooltip>
        </div>
      </>
    </div>
  );
}
