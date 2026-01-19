import "./Modules.css";
import { useState } from "react";
import type { ModuleType } from '../../../types/Modules/ModuleType.tsx';
import ModuleCard from '../../../cards/ModuleCard/ModuleCard.tsx';
import add_cta from '../../../assets/icons/add-cta.svg';


const modules: ModuleType[] = [
  {
    id: 1,
    title: "Store Orientation and Navigation",
    hours: "1:30",
    numLessons: 3,
    deployed: true
  },
  {
    id: 2,
    title: "Product Knowledge & Inventory",
    hours: "1:30",
    numLessons: 3,
  },
  {
    id: 3,
    title: "Customer Interaction & Communication",
    hours: "1:30",
    numLessons: 3,
  },
  {
    id: 4,
    title: "Checkout, POS, & Transactions",
    hours: "1:30",
    numLessons: 3,
  },
  {
    id: 5,
    title: "Safety, Compliance, & Store Policy",
    hours: "1:30",
    numLessons: 3,
  },
  {
    id: 6,
    title: "Multitasking & Real World Pressure",
    hours: "1:30",
    numLessons: 3,
  },
];

export default function Modules() {
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
                <div className="fab-option">New Simulation Module</div>
                <div className="fab-option">New Standard Module</div>
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
