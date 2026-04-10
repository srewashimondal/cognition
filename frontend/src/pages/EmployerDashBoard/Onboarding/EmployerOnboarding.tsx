import './EmployerOnboarding.css';
import { useState, useEffect } from 'react';
import { db, storage } from '../../../firebase.ts';
import { doc, getDoc, updateDoc, addDoc, collection, arrayUnion } from 'firebase/firestore';
import { uploadImage } from '../../../utils/Utils.tsx';
import { ref, uploadBytes } from 'firebase/storage';
import OBMain from './OBMain/OBMain';
import JoinWorkspace from './JoinWorkspace/JoinWorkspace';
import LoadingPage from '../../LoadingPages/LoadingPage/LoadingPage.tsx';
import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import type { OnboardingData } from '../../../types/Onboarding/OnboardingData';
import white_check from '../../../assets/icons/white-check.svg';
import { useAuth } from "../../../context/AuthProvider.tsx"; 
import { useNavigate } from 'react-router-dom';

export default function EmployerOnboarding() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [workspaceRef, setWorkspaceRef] = useState<any>(null);
    const [show, setShow] = useState(false);
    const [option, setOption] = useState<"create" | "join" | null>(null);

    if (authLoading) {
        return (
            <LoadingPage />
        );
    }

    const steps = option === "create"
    ? {
      "Profile Setup": ["Personal Info", "Account Preferences"],
      "Workspace Setup": ["Workspace Info", "Store Info", "Team Details"],
      "Tailor Cognition AI": ["Training Materials", "POS Integration", "Store Layout", "Simulation Preferences"],
      "Invite & Launch": ["Invite Team", "Launch"]
    }
    : {
        "Profile Setup": ["Personal Info", "Account Preferences"],
        "Tailor Cognition AI": ["Training Materials", "POS Integration", "Store Layout", "Simulation Preferences"],
        "Invite & Launch": ["Invite Team", "Launch"]
        };

    const [stepIndex, setStepIndex] = useState(0);
    const [subStepIndex, setSubStepIndex] = useState(0);

    useEffect(() => {
        setStepIndex(0);
        setSubStepIndex(0);
        setActiveFormId(null);
    }, [option]);

    const stepTitles = Object.keys(steps) as Array<keyof typeof steps>;
    const currentStepTitle = stepTitles[stepIndex];
    const substeps = steps[currentStepTitle]!;

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
          const prevSubsteps = steps[prevStepTitle]!;
      
          setStepIndex(prevStepIndex);
          setSubStepIndex(prevSubsteps.length - 1);
        }
    };
      

    const [data, setData] = useState<OnboardingData>({
        fullName: "",
        jobTitle: "",
        displayName: "",
        profilePicture: null,
        notificationPreference: [],
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

    useEffect(() => {
        if (option === "create") {
            setData(prev => ({
                ...prev,
                workspaceName: "",
                workspaceIcon: null,
                accessibilityPref: false,
                storeName: "",
                retailCategory: "Beauty & Cosmetics",
                storeFormat: "Standalone Store",
                numEmployees: [0, 100],
                expLevel: "",
                challenge: []
            }));
        } 
    }, [option]);

    const [activeFormId, setActiveFormId] = useState<string | null>(null);
    
    const BASE_FLOW = [
        "personal-info-form",
        "account-preferences-form",
        "training-materials-form",
        "pos-integration-form",
        "store-layout-form",
        "simulation-preferences-form",
        "invite-team-form",
        "launch-workspace",
    ] as const;
      
    const CREATE_ONLY_FLOW = [
        "workspace-info-form",
        "store-info-form",
        "team-details-form",
    ] as const;

    const SUBSECTION_FLOW = option === "create"
    ? [
        "personal-info-form",
        "account-preferences-form",
        ...CREATE_ONLY_FLOW,
        "training-materials-form",
        "pos-integration-form",
        "store-layout-form",
        "simulation-preferences-form",
        "invite-team-form",
        "launch-workspace",
    ] : BASE_FLOW;

    const currentSubIdx = activeFormId ? SUBSECTION_FLOW.indexOf(activeFormId as any) : 0;
    const percent = (activeFormId !== "invite-team-form") ? 
                    ((activeFormId !== "launch-workspace") ?
                        (Math.floor((currentSubIdx / 11) * 100)) : 100) : 95;

    const [saving, setSaving] = useState(false);
    const handleSave = async () => {
        if (!user?.uid) return;

        setSaving(true);

        try {
        
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) return;

            const workspaceRef = userSnap.data().workspaceID;
            if (!workspaceRef) return; 

            const workspaceSnap = await getDoc(workspaceRef);
            const workspaceData = workspaceSnap.exists() ? workspaceSnap.data() as any : {};

            let userUpdates: any = {
                fullName: data.fullName,
                jobTitle: data.jobTitle,
                displayName: data.displayName,
                notificationPreference: data.notificationPreference,
            };
              
            if (data.profilePicture instanceof File) {
                const path = `profilePictures/${user.uid}-${Date.now()}`;
                const url = await uploadImage(data.profilePicture, path);
                
                userUpdates.profilePicture = url;
            }
              
            await updateDoc(userRef, userUpdates);

            // create flow
            let storeRef: any = null;

            if (option === "create" ) {
                if (!workspaceData.storeID && data.storeName) {
                    storeRef = await addDoc(collection(db, "stores"), {
                        storeName: data.storeName,
                        category: data.retailCategory,
                        storeFormat: data.storeFormat
                    })
                }

                const workspaceUpdates: any = {};

                if (!workspaceData.name && data.workspaceName) {
                    workspaceUpdates.name = data.workspaceName;
                }

                if (!workspaceData.accessibilityPref && data.accessibilityPref !== undefined) {
                    workspaceUpdates.accessibilityPref = data.accessibilityPref;
                }
            
                if (!workspaceData.expLevel && data.expLevel) {
                    workspaceUpdates.expLevel = data.expLevel;
                }
        
                if (!workspaceData.numEmployees && data.numEmployees) {
                    workspaceUpdates.numEmployees = data.numEmployees;
                }
        
                if (!workspaceData.challenge && data.challenge?.length) {
                    workspaceUpdates.challenge = data.challenge;
                }

                if (!workspaceData.storeID && storeRef) {
                    workspaceUpdates.storeID = storeRef;
                }

                if (data.workspaceIcon instanceof File && !workspaceData.icon) {
                    const path = `workspaceIcons/${workspaceRef.id}-${Date.now()}`;
                    const url = await uploadImage(data.workspaceIcon, path);
                  
                    workspaceUpdates.icon = url;
                }

                if (Object.keys(workspaceUpdates).length > 0) {
                    await updateDoc(workspaceRef, workspaceUpdates);
                }
            
            }

            // file uploads
            // make nested helper function
            const uploadResource = async (file: File, type: "map" | "document") => {
                let structuredSummaryString: string = "";
                const endpoint = type === "map" ? "http://127.0.0.1:8000/ai/analyze-map" : "http://127.0.0.1:8000/ai/summarize-document";
                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch(endpoint, {
                    method: "POST",
                    body: formData,
                });
            
                if (!res.ok) {
                    throw new Error("Failed to process file");
                }
            
                const summaryData = await res.json();
                structuredSummaryString = JSON.stringify(summaryData);

                const workspaceId = workspaceRef.id;
                const storagePath = `trainingDocuments/${workspaceId}/${Date.now()}-${file.name}`;
                const storageRef = ref(storage, storagePath);
                await uploadBytes(storageRef, file);
                const title = file.name.replace(/\.[^/.]+$/, "");
          
                await addDoc(collection(db, "workspaces", workspaceId, "resources"), {
                    title,
                    filePath: storagePath,
                    type,
                    section: type === "map" ? "Maps" : "Training & Operations",
                    summary: structuredSummaryString
                });
            };

            if (data.uploadedPDF?.length) {
                for (const file of data.uploadedPDF) {
                    await uploadResource(file, "document");
                }
            }

            if (data.map) {
                await uploadResource(data.map, "map");
            }

            await updateDoc(workspaceRef, {
                scenTypes: arrayUnion(...data.scenTypes),
                difficultyLevel: data.difficultyLevel,
                layoutType: data.type,
            });

        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setSaving(false);
            navigate('/employer/home');
        }
    }

    return (
        <div className="ob-pg">
            { saving ?
                <div className={`ob-modal saving ${show ? "show" : ""}`}>
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
                    <h3 className="ob-sidebar-title">Let's get you set up</h3>
                    <div className="ob-progress-bar">
                        <ProgressBar percent={percent} style={true} />
                    </div>
                    <div className="sidebar-steps">
                        <div className="sidebar-line" />
                        {stepTitles.map((title, index) => {
                                const isCompleted = (index < stepIndex) || (activeFormId === "launch-workspace");
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
                        user={user}
                        data={data} 
                        updateData={updateData} 
                        activeFormId={activeFormId} 
                        setActiveFormId={setActiveFormId} 
                        stepTitle={currentStepTitle} 
                        substeps={substeps} 
                        subStep={subStepIndex}
                        onNext={handleNext} 
                        onBack={handleBack} 
                        option={option}
                        setComplete={handleSave}
                    />
                </div>
            </div>
            : <JoinWorkspace 
                user={user} 
                setWorkspaceRef={setWorkspaceRef} 
                option={option}
                setOption={setOption}
                onNext={setShow}
            />
            }
        </div>
    );
}