import TrainingMaterials from "./Subsections/TrainingMaterials";
import POSIntegration from "./Subsections/POSIntegration";
import StoreLayout from "./Subsections/StoreLayout";
import SimulationPreferences from "./Subsections/SimulationPreferences";
import type { OnboardingSection } from "../../../../types/Onboarding/OnboardingSection";


export default function TailorCognitionAI({ user, substep, data, updateData, registerFormId, onNext }: OnboardingSection & { user: any }) {
    return (
        <div className="cw-div">
            {(substep === 0) && <TrainingMaterials data={data} updateData={updateData} registerFormId={registerFormId} onNext={onNext} />}
            {(substep === 1) && <POSIntegration user={user} data={data} updateData={updateData} registerFormId={registerFormId} onNext={onNext} />}
            {(substep === 2) && <StoreLayout data={data} updateData={updateData} registerFormId={registerFormId} onNext={onNext} />}
            {(substep === 3) && <SimulationPreferences data={data} updateData={updateData} registerFormId={registerFormId} onNext={onNext} />}
        </div>
    );
}