import WorkspaceInfo from "./Subsections/WorkspaceInfo";
import StoreInfo from "./Subsections/StoreInfo";
import TeamDetails from "./Subsections/TeamDetails";
import type { OnboardingSection } from "../../../../types/OnboardingSection";

export default function CreateWorkspace({ substep, data, updateData }: OnboardingSection) {
    return (
        <div className="cw-div">
            {(substep === 0) && <WorkspaceInfo data={data} updateData={updateData} />}
            {(substep === 1) && <StoreInfo data={data} updateData={updateData} />}
            {(substep === 2) && <TeamDetails data={data} updateData={updateData} />}
        </div>
    );
}