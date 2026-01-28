import './EmployeeOnboarding.css';
import { useEffect } from 'react';
import ProfileSetup from './ProfileSetup';
import LearningSetup from './LearningSetup';
import type { EmployeeOnboardingData } from '../../../types/Onboarding/OnboardingData';
import orange_right_arrow from '../../../assets/icons/orange-right-arrow.svg';
import orange_left_arrow from '../../../assets/icons/orange-left-arrow.svg';
import orange_ready_icon from '../../../assets/icons/orange-ready-icon.svg';

type OBMainProps = {
    data: Record<string, any>;
    updateData: (updates: Partial<EmployeeOnboardingData>) => void;
    activeFormId: string | null;
    setActiveFormId: React.Dispatch<React.SetStateAction<string | null>>;
    stepTitle: string;
    substeps: readonly string[];
    subStep: number;
    onNext: () => void;
    onBack: () => void;
}

export default function OBMain({ data, updateData, activeFormId, setActiveFormId, stepTitle, substeps, subStep, onNext, onBack }: OBMainProps) {
    return (
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
                {stepTitle === "Profile Setup" && (
                    <ProfileSetup substep={subStep} data={data} updateData={updateData} registerFormId={setActiveFormId} onNext={onNext}/>
                )}
                {stepTitle === "Learning Setup" && (
                    <LearningSetup substep={subStep} data={data} updateData={updateData} registerFormId={setActiveFormId} onNext={onNext}/>
                )}
                {stepTitle === "Start Learning" && (
                    <StartLearning registerFormId={setActiveFormId} />
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

                {((stepTitle !== "Start Learning" ) || (subStep !== substeps.length - 1)) && 
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
    );
}

function StartLearning({ registerFormId }: { registerFormId: (id: string) => void}) {
    const formId = "start-learning";
    useEffect(() => {
        registerFormId(formId);
        return () => registerFormId(""); 
    }, []);

    return (
        <div className="il-div employee">
            <div className="lw-div">
                <img src={orange_ready_icon} />
                <h3>You're all set!</h3>
                <p>Ready to start learning?</p>
                <button type="button">
                    Open Dashboard
                </button>
            </div>
        </div>
    );
}