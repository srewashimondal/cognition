import "./Modules.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { modules } from '../../../dummy_data/modules_data.tsx';
import ModuleCard from '../../../cards/ModuleCard/ModuleCard.tsx';
import add_cta from '../../../assets/icons/add-cta.svg';

export default function Modules() {
  const navigate = useNavigate();
  const [addSelected, setAddSelected] = useState(false);

  return (
    <div className="modules-page">
      {/* Header */}
      <div className="modules-header">
        <div>
          <h1>Modules Catalog</h1>
          <p>Access and review past training sessions</p>
        </div>

      </div>

      {/* Grid */}
      <div className="modules-grid">
        {modules.map((m) => (<ModuleCard moduleInfo={m} role={"employer"} />))}
      </div>

      {/* Pagination */} {/* Note: maybe make a pagination component laterr */}
      <div className="pagination">
        <button disabled>{"<"}</button>
        <button className="active">1</button>
        <button>{">"}</button>
      </div>

      {/* Floating Add Button */}
      <>
        {addSelected && <div className="drawer-backdrop module" onClick={() => setAddSelected(false)} />}
        <div className="fab-wrapper">
          { addSelected && (
              <div className="fab-options">
                <div className="fab-option" onClick={() => navigate(`/employer/builder`)}>New Simulation Module</div>
                <div className="fab-option" onClick={() => navigate(`/employer/standard-builder`)}>New Standard Module</div>
                <div className="fab-options-line" />
              </div>
            )
          }
          <button className={`fab ${addSelected ? "selected" : ""}`} onClick={() => setAddSelected(prev => !prev)}>
            <img src={add_cta}/>
          </button>
        </div>
      </>
    </div>
  );
}
