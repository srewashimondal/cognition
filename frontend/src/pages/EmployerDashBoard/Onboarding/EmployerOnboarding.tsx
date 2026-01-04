import './EmployerOnboarding.css';
import { useState } from 'react';
import OBMain from './OBMain/OBMain';
import type { OnboardingData } from '../../../types/OnboardingData';
import white_check from '../../../assets/icons/white-check.svg';

export default function EmployerOnboarding() {
    const steps = {
        "Profile Setup": ["Personal Info", "Account Preferences"],
        "Create Workspace": ["Workspace Info", "Store Info", "Team Details"],
        "Tailor Cognition AI": ["Training Materials", "POS Integration", "Store Layout", "Simulation Preferences"],
        "Invite & Launch": ["Invite Team", "Launch"]
     } as const;

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
      

    const [data, setData] = useState<OnboardingData>({
        fullName: "",
        workEmail: "",
        jobTitle: "",
        displayName: "",
        profilePicture: null,
        notificationPreference: [],
        workspaceName: "",
        workspaceIcon: null,
        accessibilityPref: [],
        storeName: "",
        retailCategory: "Beauty & Cosmetics",
        storeFormat: "",
        numEmployees: [0,100],
        expLevel: "",
        challenge: [],
        uploadedPDF: [],
        posProvider: "",
        selectedSettings: ["Sync Inventory", "Sync Products"],
        map: null,
        type: "Aisles",
        scenTypes: [],
        difficultyLevel: "Beginner",
    });

    const updateData = (updates: Partial<OnboardingData>) => {
        setData(d => ({ ...d, ...updates}));
    };
      
      
    return (
        <div className="ob-pg">
            <div className="ob-modal">
                <div className="ob-sidebar">
                    <h3 className="ob-sidebar-title">Onboarding Wizard</h3>

                    <div className="sidebar-steps">
                        <div className="sidebar-line" />
                        {stepTitles.map((title, index) => {
                                const isCompleted = index < stepIndex;
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
                    <OBMain data={data} updateData={updateData} stepTitle={currentStepTitle} substeps={substeps} subStep={subStepIndex}
                    onNext={handleNext} onBack={handleBack} />
                </div>
            </div>
        </div>
    );
}