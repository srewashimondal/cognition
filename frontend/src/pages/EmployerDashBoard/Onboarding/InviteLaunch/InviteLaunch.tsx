import InviteTeam from "./Subsections/InviteTeam";
import LaunchWorkspace from "./Subsections/LaunchWorkspace";
import type { OnboardingSection } from "../../../../types/OnboardingSection";


export default function InviteLaunch({ substep, data, updateData, registerFormId, onNext }: OnboardingSection) {
    return (
        <div className="il-div">
            {(substep === 0) && <InviteTeam registerFormId={registerFormId} onNext={onNext} />}
            {(substep === 1) && <LaunchWorkspace registerFormId={registerFormId} />}
        </div>
    );
}