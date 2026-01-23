import './StandardModules.css';
import { standardModuleAttempt } from '../../../dummy_data/standardAttempt_data';
import ModuleCard from '../../../cards/ModuleCard/ModuleCard';

export default function StandardModules() {
    return (
        <div className="standard-lesson-view">
            <div className="modules-header">
                <div>
                    <h1>Standard Modules</h1>
                    <p></p>
                </div>
            </div>

            <div className="modules-grid">
                {standardModuleAttempt.map((m) => (<ModuleCard moduleInfo={m.moduleInfo} type={"standard"} role={"employee"} status={m.status} percent={m.percent} style={true} />))}
            </div>

            <div className="filler-space"></div>
        </div>
    );
}