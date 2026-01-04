import '../TailorCognition.css';
import Question from "../../Question/Question";
import lightspeed_logo from '../../../../../assets/illustrations/lightspeed_logo.svg';
import zoho_logo from '../../../../../assets/illustrations/zoho_logo.png';
import type { OnboardingSubsection } from "../../../../../types/OnboardingSubsection";

export default function POSIntegration({ data, updateData }: OnboardingSubsection) {
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        {/* put in backend logic later */}
    }

    return (
        <div className="posi-div">
            <form onSubmit={handleSubmit}>

            <Question question={"Select your Point of Scale System Provider"} input_type={"image-buttons"} 
            value={data.posProvider} onChange={(v) => updateData({ posProvider: v})} 
            options={["Lightspeed", "Zoho"]} fileOptions={[lightspeed_logo, zoho_logo]}
            direction={"Select an option."} />
            
            <div className="connect-div">
                <button>Connect</button>
            </div>

            <Question question={"Advanced Settings"} input_type={"checkbox"} 
            value={data.selectedSettings} onChange={(v) => updateData({ selectedSettings: v})} 
            options={["Sync Inventory", "Sync Products", "Sync Employees", "Auto-sync Employees"]} />

            </form>
        </div>
    );
}