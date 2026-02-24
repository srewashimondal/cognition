import "./Modules.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@radix-ui/themes";
import type { WorkspaceType } from "../../../types/User/WorkspaceType.tsx";
import type { StandardModuleType } from "../../../types/Standard/StandardModule.tsx";
import type { ModuleType } from "../../../types/Modules/ModuleType.tsx";
import ModuleCard from '../../../cards/ModuleCard/ModuleCard.tsx';
import add_cta from '../../../assets/icons/add-cta.svg';

import { getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { DocumentReference } from "firebase/firestore";

type Tab = "simulations" | "standard";

export default function Modules({ workspace }: { workspace: WorkspaceType}) {
  const navigate = useNavigate();
  const [addSelected, setAddSelected] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("simulations");
  const modules = workspace.simulationModules;
  const [standardModules, setStandardModules] = useState<StandardModuleType[]>([]);
  const [simulationModules, setSimulationModules] = useState<ModuleType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchStandardModules() {
      if (!workspace.standardModules || workspace.standardModules.length === 0) {
        setStandardModules([]);
        return;
      }
    
      setLoading(true);
      try {
        const modulePromises = workspace.standardModules.map(async (moduleRef: DocumentReference) => {
          const moduleSnap = await getDoc(moduleRef);
          if (moduleSnap.exists()) {
            const data = moduleSnap.data() as Omit<StandardModuleType, 'id'>;
            return {
              id: moduleRef.id, 
              ...data,
            } as StandardModuleType;
          }
          return null;
        });
    
        const modules = await Promise.all(modulePromises);
        setStandardModules(modules.filter((m): m is StandardModuleType => m !== null));
      } catch (error) {
        console.error("Error fetching standard modules:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStandardModules();
  }, [workspace.standardModules]);

  useEffect(() => {
    async function fetchSimulationModules() {
      if (!workspace.simulationModules || workspace.simulationModules.length === 0) {
        setSimulationModules([]);
        return;
      }
    
      setLoading(true);
      try {
        const modulePromises = workspace.simulationModules.map(async (moduleRef: DocumentReference) => {
          const moduleSnap = await getDoc(moduleRef);
          if (moduleSnap.exists()) {
            const data = moduleSnap.data() as Omit<ModuleType, 'id'>;
            return {
              id: moduleRef.id, 
              ...data,
            } as ModuleType;
          }
          return null;
        });
    
        const modules = await Promise.all(modulePromises);
        setSimulationModules(modules.filter((m): m is ModuleType => m !== null));
      } catch (error) {
        console.error("Error fetching standard modules:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSimulationModules();
  }, [workspace.simulationModules]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

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
          {simulationModules.map((m) => (<ModuleCard moduleInfo={m} type={"simulation"} role={"employer"} />))}
        </div> :
        <div className="modules-grid">
          {standardModules.map((m) => (<ModuleCard moduleInfo={m} type={"standard"} role={"employer"} />))}
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
          <Tooltip content={addSelected ? "Exit create" : "New module"}>
            <button className={`fab ${addSelected ? "selected" : ""}`} onClick={() => setAddSelected(prev => !prev)}>
              <img src={add_cta}/>
            </button>
          </Tooltip>
        </div>
      </>
    </div>
  );
}
