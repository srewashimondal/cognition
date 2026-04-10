import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthProvider.tsx';
import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import OBMain from './OBMain.tsx';
import LoadingPage from '../../LoadingPages/LoadingPage/LoadingPage.tsx';
import JoinWorkspace from './JoinWorkspace.tsx';
import { db } from '../../../firebase.ts';
import { uploadImage } from '../../../utils/Utils.tsx';
import { doc, updateDoc } from 'firebase/firestore';
import type { EmployeeOnboardingData } from '../../../types/Onboarding/OnboardingData';
import white_check from '../../../assets/icons/white-check.svg';

export default function EmployeeOnboarding() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [workspaceRef, setWorkspaceRef] = useState<any>(null);
    const [show, setShow] = useState(false);

    if (authLoading) {
        return (
            <LoadingPage />
        );
    }

    useEffect(() => {
        if (workspaceRef) {
            setShow(false);
        
            setTimeout(() => {
                setShow(true);
            }, 50);
        }
    }, [workspaceRef]);

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

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!user?.uid) return;

        setSaving(true);

        try {
            const userRef = doc(db, "users", user.uid);

            const userUpdates: any = {
                fullName: data.fullName,
                jobTitle: data.jobTitle,
                displayName: data.displayName,
                notificationPreference: data.notificationPreference,
                confidence: data.confidence,
                customerInteraction: data.customerInteraction,
                haveADHD: data.haveADHD,
                learningPreference: data.learningPreference,
                improvements: data.improvements
            };

            if (data.profilePicture instanceof File) {
                const path = `profilePictures/${user.uid}-${Date.now()}`;
                const url = await uploadImage(data.profilePicture, path);
                userUpdates.profilePicture = url;
            }

            await updateDoc(userRef, userUpdates);

        } catch (err) {
            console.error("Employee onboarding save failed:", err);
        } finally {
            setSaving(false);
            navigate('/employee/home');
        }
    };


    return (
        <div className="ob-pg">

            <div className={`ob-modal saving ${saving ? "show" : ""}`} >
                <div className="jw-icon blue big">
                    ⏳
                </div>
                <h3>Hang on tight!</h3>
                <div className="saving-bar-track">
                    <div className="saving-bar-streak" />
                </div>
                <p>You're almost ready. We're just getting you set up.</p>
            </div>
            : workspaceRef ?
            <div className={`ob-modal ${show ? "show" : ""}`}>
                <div className="ob-sidebar">
                    <h3 className="ob-sidebar-title">Onboarding Wizard</h3>
                    <div className="ob-progress-bar">
                        <ProgressBar percent={percent} style={true} />
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
                    <OBMain 
                        data={data} 
                        updateData={updateData} 
                        activeFormId={activeFormId} 
                        setActiveFormId={setActiveFormId} 
                        stepTitle={currentStepTitle} 
                        substeps={substeps} 
                        subStep={subStepIndex}
                        onNext={handleNext} 
                        onBack={handleBack} 
                        onSave={handleSave}
                    />
                </div>
            </div>
            : <JoinWorkspace 
                user={user} 
                setWorkspaceRef={setWorkspaceRef} 
                onNext={setShow}
            /> 
        </div>
    );
}

