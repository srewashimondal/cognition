import TrainingMaterials from "./Subsections/TrainingMaterials";
import POSIntegration from "./Subsections/POSIntegration";
import StoreLayout from "./Subsections/StoreLayout";
import SimulationPreferences from "./Subsections/SimulationPreferences";

type TailorCognitionAIProps = {
    substep: number;
}

export default function TailorCognitionAI({ substep }: TailorCognitionAIProps) {
    return (
        <div className="cw-div">
            {(substep === 0) && <TrainingMaterials />}
            {(substep === 1) && <POSIntegration />}
            {(substep === 2) && <StoreLayout />}
            {(substep === 3) && <SimulationPreferences />}
        </div>
    );
}