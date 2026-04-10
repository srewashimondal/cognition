import InviteTeam from "./Subsections/InviteTeam";
import LaunchWorkspace from "./Subsections/LaunchWorkspace";
import type { OnboardingSection } from "../../../../types/Onboarding/OnboardingSection";


export default function InviteLaunch({ 
                                        user, 
                                        option, 
                                        substep, 
                                        registerFormId, 
                                        onNext,
                                        setComplete
                                    }: OnboardingSection & 
                                    { user: any,
                                     option: "create" | "join" | null,
                                    setComplete: () => void; }) {
    return (
        <div className="il-div">
            {(substep === 0) && <InviteTeam user={user} registerFormId={registerFormId} onNext={onNext} />}
            {(substep === 1) && <LaunchWorkspace option={option} registerFormId={registerFormId} setComplete={setComplete} />}
        </div>
    );
}