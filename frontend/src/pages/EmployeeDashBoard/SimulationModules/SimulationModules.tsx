import './SimulationModules.css';
import { moduleAttempts } from '../../../dummy_data/modulesAttempt_data';
import ModuleCard from '../../../cards/ModuleCard/ModuleCard';

/*
const modules: ModuleAttemptType[] = [
    {   
        attempt_id: 1,
        moduleInfo: {
            id: 1,
            title: "Store Orientation and Navigation",
            hours: "1:30",
            numLessons: 3,
            deployed: true 
        },
        status: "completed"
    },
    {   
        attempt_id: 2,
        moduleInfo: {
            id: 2,
            title: "Product Knowledge & Inventory",
            hours: "1:30",
            numLessons: 3
        },
        status: "started",
        percent: 60
    },
    {   
        attempt_id: 3,
        moduleInfo: {
        id: 3,
        title: "Customer Interaction & Communication",
        hours: "1:30",
        numLessons: 3
        },
        status: "not begun"
    },
    {   
        attempt_id: 4,
        moduleInfo: {
            id: 4,
            title: "Checkout, POS, & Transactions",
            hours: "1:30",
            numLessons: 3,
        },
        status: "not begun"
    },
    {   
        attempt_id: 5,
        moduleInfo: {
            id: 5,
            title: "Safety, Compliance, & Store Policy",
            hours: "1:30",
            numLessons: 3,
        },
        status: "not begun"
    },
    {   
        attempt_id: 6,
        moduleInfo: {
            id: 6,
            title: "Multitasking & Real World Pressure",
            hours: "1:30",
            numLessons: 3,
        },
        status: "not begun"
    },
];
*/
export default function SimulationModules() {
    return (
        <div className="employee-modules">
            <div className="modules-header">
                <div>
                    <h1>Simulation Modules</h1>
                    <p>View simulation tasks.</p>
                </div>
            </div>

            <div className="modules-grid">
                {moduleAttempts.map((m) => (<ModuleCard moduleInfo={m.moduleInfo} role={"employee"} status={m.status} percent={m.percent} style={true} />))}
            </div>

            <div className="filler-space"></div>
        </div>
    );
}