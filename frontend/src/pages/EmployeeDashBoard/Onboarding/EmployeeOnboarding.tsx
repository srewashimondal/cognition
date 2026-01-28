import { useState } from 'react';
import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import OBMain from './OBMain.tsx';
import type { EmployeeOnboardingData } from '../../../types/Onboarding/OnboardingData';
import white_check from '../../../assets/icons/white-check.svg';

export default function EmployeeOnboarding() {
    const steps = {
        "Profile Setup": ["Personal Info", "Account Preferences"],
        "Learning Setup": ["Role Information", "Learning Preferences"],
        "Start Learning": ["Start Learning"]
    }

    const [stepIndex, setStepIndex] = useState(0);
    const [subStepIndex, setSubStepIndex] = useState(0);

    const stepTitles = Object.keys(steps) as Array<keyof typeof steps>;
    const currentStepTitle = stepTitles[stepIndex];
    const substeps = steps[currentStepTitle];

    const handleNext = () => {
        if (subStepIndex < substeps.length - 1) {
          setSubStepIndex(prev => prev + 1);
        } else if (stepIndex < stepTitles.length - 1) {
          setStepIndex(prev => prev + 1);
          setSubStepIndex(0);
        }
    };

    const handleBack = () => {
        if (subStepIndex > 0) {
          setSubStepIndex(prev => prev - 1);
        } else if (stepIndex > 0) {
          const prevStepIndex = stepIndex - 1;
          const prevStepTitle = stepTitles[prevStepIndex];
          const prevSubsteps = steps[prevStepTitle];
      
          setStepIndex(prevStepIndex);
          setSubStepIndex(prevSubsteps.length - 1);
        }
    };

    const [data, setData] = useState<EmployeeOnboardingData>({
        fullName: "",
        workEmail: "",
        jobTitle: [],
        displayName: "",
        profilePicture: null,
        notificationPreference: [],
        confidence: "Still learning",
        customerInteraction: "Low",
        haveADHD: false,
        learningPreference: [],
        improvements: []
    });

    const updateData = (updates: Partial<EmployeeOnboardingData>) => {
        setData(d => ({ ...d, ...updates}));
    };

    const [activeFormId, setActiveFormId] = useState<string | null>(null);

    const SUBSECTION_FLOW = [
        "personal-info-form",
        "account-preferences-form",
        "role-info-form",
        "learning-preferences-form",
        "start-learning"
    ] as const;

    const currentSubIdx = activeFormId ? SUBSECTION_FLOW.indexOf(activeFormId as any) : 0;
    const percent = (activeFormId !== "start-learning") ? (Math.floor((currentSubIdx / 5) * 100)) : 100;


    return (
        <div className="ob-pg">
            <div className="ob-modal">
                <div className="ob-sidebar">
                    <h3 className="ob-sidebar-title">Onboarding Wizard</h3>
                    <div className="ob-progress-bar">
                        <ProgressBar percent={percent} />
                    </div>
                    <div className="sidebar-steps">
                        <div className="sidebar-line" />
                        {stepTitles.map((title, index) => {
                                const isCompleted = (index < stepIndex) || (activeFormId === "start-learning");
                                const isCurrent = index === stepIndex;

                                return (
                                    <div className="sidebar-step" key={title}>
                                        <div className="sidebar-step-indicator">
                                            <div
                                                className={`step-circle
                                                ${isCompleted ? "completed" : ""}
                                                ${isCurrent ? "current" : ""}
                                                `}
                                            >
                                                {isCompleted && <img src={white_check} alt="completed" />}
                                            </div>
                                        </div>

                                        <span
                                            className={`sidebar-step-label ${
                                                isCurrent ? "current" : ""
                                            }`}
                                        >
                                            {title}
                                        </span>
                                    </div>
                                );
                            })}
                    </div>
                </div>
                <div className="ob-main">
                    <OBMain data={data} updateData={updateData} activeFormId={activeFormId} setActiveFormId={setActiveFormId} stepTitle={currentStepTitle} substeps={substeps} subStep={subStepIndex}
                    onNext={handleNext} onBack={handleBack} />
                </div>
            </div>
        </div>
    );
}

