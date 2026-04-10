import './OBMain.css';
import type { OnboardingData } from '../../../../types/Onboarding/OnboardingData';
import ProfileSetup from '../ProfileSetup/ProfileSetup';
import CreateWorkspace from '../CreateWorkspace/CreateWorkspace';
import TailorCognitionAI from '../TailorCognitionAI/TailorCognitionAI';
import InviteLaunch from '../InviteLaunch/InviteLaunch';
import orange_right_arrow from '../../../../assets/icons/orange-right-arrow.svg';
import orange_left_arrow from '../../../../assets/icons/orange-left-arrow.svg';

type OBMainProps = {
    user: any;
    data: Record<string, any>;
    updateData: (updates: Partial<OnboardingData>) => void;
    activeFormId: string | null;
    setActiveFormId: React.Dispatch<React.SetStateAction<string | null>>;
    stepTitle: string;
    substeps: readonly string[];
    subStep: number;
    onNext: () => void;
    onBack: () => void;
    option: "create" | "join" | null;
    setComplete: () => void;
  };

export default function OBMain({ user, data, updateData, activeFormId, setActiveFormId, stepTitle, substeps, subStep, onNext, onBack, option, setComplete }:OBMainProps) {

    return(
        <div className="ob-main-div">
        <div className="stepper">
            {substeps.map((label, index) => (
            <div className="step" key={label}>
                <div className={`step-line ${index <= subStep ? "active" : ""}`} />
                <span
                className={`step-label ${index === subStep ? "current" : ""}`}
                >
                {label}
                </span>
            </div>
            ))}
        </div>

        <div className="step-contents">
            <div key={`${stepTitle}-${subStep}`} className="step-contents-inner">
                {stepTitle === "Profile Setup" && (
                    <ProfileSetup 
                        substep={subStep} 
                        data={data} 
                        updateData={updateData} 
                        registerFormId={setActiveFormId} 
                        onNext={onNext}
                    />
                )}

                {stepTitle === "Workspace Setup" && option === "create" && (
                    <CreateWorkspace 
                        substep={subStep} 
                        data={data} 
                        updateData={updateData} 
                        registerFormId={setActiveFormId} 
                        onNext={onNext} 
                    />
                )}

                {stepTitle === "Tailor Cognition AI" && (
                    <TailorCognitionAI 
                        user={user} 
                        substep={subStep} 
                        data={data} 
                        updateData={updateData} 
                        registerFormId={setActiveFormId} 
                        onNext={onNext} 
                    />
                )}

                {stepTitle === "Invite & Launch" && (
                    <InviteLaunch 
                        user={user} 
                        option={option} 
                        substep={subStep} 
                        data={data} 
                        updateData={updateData} 
                        registerFormId={setActiveFormId} 
                        onNext={onNext} 
                        setComplete={setComplete}
                    />
                )}
            </div>

            <div className="next-section-div">
                {((stepTitle !== "Profile Setup" ) || (subStep > 0)) && (
                <div className="back-btn" onClick={onBack}>
                    <span className="arrow-icon">
                        <img src={orange_left_arrow} />
                    </span>
                </div>
                )}

                <div className="space"></div>

                {((stepTitle !== "Invite & Launch" ) || (subStep !== substeps.length - 1)) && 
                <button type="submit" form={activeFormId ?? undefined} className="next-section-btn">
                    <span className="next-section-text">
                        Next Section
                    </span>
                    <span className="arrow-icon">
                        <img src={orange_right_arrow} />
                    </span>
                </button>}
            </div>
        </div>
    </div>
    );
}