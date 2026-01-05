import TrainingMaterials from "./Subsections/TrainingMaterials";
import POSIntegration from "./Subsections/POSIntegration";
import StoreLayout from "./Subsections/StoreLayout";
import SimulationPreferences from "./Subsections/SimulationPreferences";
import type { OnboardingSection } from "../../../../types/OnboardingSection";


export default function TailorCognitionAI({ substep, data, updateData, registerFormId, onNext }: OnboardingSection) {
    return (
        <div className="cw-div">
            {(substep === 0) && <TrainingMaterials data={data} updateData={updateData} registerFormId={registerFormId} onNext={onNext} />}
            {(substep === 1) && <POSIntegration data={data} updateData={updateData} registerFormId={registerFormId} onNext={onNext} />}
            {(substep === 2) && <StoreLayout data={data} updateData={updateData} registerFormId={registerFormId} onNext={onNext} />}
            {(substep === 3) && <SimulationPreferences data={data} updateData={updateData} registerFormId={registerFormId} onNext={onNext} />}
        </div>
    );
}