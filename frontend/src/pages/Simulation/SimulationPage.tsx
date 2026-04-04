import './SimulationPage.css';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VoiceMode from './VoiceMode/VoiceMode';
import TypeMode from './TypeMode/TypeMode';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import ActionButton from '../../components/ActionButton/ActionButton';
import SkillItem from '../../cards/LessonCard/SkillItem/SkillItem';
import { collection, doc, query,  getDoc, setDoc, onSnapshot, orderBy, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db, storage } from "../../firebase";
import { getDownloadURL, ref } from "firebase/storage";
import type { DocumentReference } from 'firebase/firestore';
import type { ResourceItem } from '../EmployerDashBoard/Resources/Resources';
import type { LessonAttemptType } from '../../types/Modules/Lessons/LessonAttemptType';
import type { ModuleType } from '../../types/Modules/ModuleType';
// dummy data
import black_lines_icon from '../../assets/icons/simulations/black-lines-icon.svg';
import black_ai_icon from '../../assets/icons/simulations/black-ai-icon.svg';
import grey_lines_icon from '../../assets/icons/simulations/grey-lines-icon.svg';
import grey_ai_icon from '../../assets/icons/simulations/grey-ai-icon.svg';
import message_icon from '../../assets/icons/simulations/message-icon.svg';
import blue_trend_icon from '../../assets/icons/simulations/blue-trending-up-icon.svg';
import x_icon from '../../assets/icons/simulations/grey-x-icon.svg';
import note_icon from '../../assets/icons/orange-note-icon.svg';
import left_arrow from '../../assets/icons/orange-left-arrow.svg';
import clock_icon from '../../assets/icons/simulations/black-clock-icon.svg';
import voice_msg_icon from '../../assets/icons/chatbar/voice-msg-icon.svg';
import keyboard_icon from '../../assets/icons/grey-keyboard-icon.svg';
import type { LessonType } from '../../types/Modules/Lessons/LessonType';
import type { MessageType } from '../../types/Modules/Lessons/Simulations/MessageType';
import GenerationLoadingPage from '../LoadingPages/GenerationLoading/GenerationLoadingPage';
import LoadingPage from '../LoadingPages/LoadingPage/LoadingPage';

export default function SimulationPage({ role, workspaceID }: { role: "employee" | "employer", workspaceID: string }) {
    const { moduleID, lessonID, simIdx } = useParams();
    const simulationIndex = Number(simIdx);

    const [lessonAttempt, setLessonAttempt] = useState<LessonAttemptType | null>(null);
    const [simData, setSimData] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [voiceMode, setVoiceMode] = useState(true);
    const [selectOption, setSelectOption] = useState<"premise" | "feedback">("premise");
    const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
    const messageInfo = selectedMessage !== null ? (messages?.find(m => selectedMessage === m.id)) ?? null : null;
    const feedbackInfo = selectedMessage !== null ? (messages?.find(m => selectedMessage === m.replyToId)) ?? null : null;
    const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [references, setReferences] = useState<ResourceItem[]>([]);
    const [selectedRef, setSelectedRef] = useState<ResourceItem | null>(null);
    const [moduleTitle, setModuleTitle] = useState<string>("");

    const authLoading = !lessonAttempt;
    const simulationLoading = !simData || simData.generationStatus !== "ready";

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

    useEffect(() => {
        if (!lessonID) return;
      
        const lessonAttemptRef = doc(
            db,
            "simulationLessonAttempts",
            lessonID
        );
        
        const unsub = onSnapshot(lessonAttemptRef, async (snap) => {
            if (!snap.exists()) return;

            const attemptData = snap.data() as Omit<LessonAttemptType, "id" | "lessonInfo"> 
                & { lessonInfo: DocumentReference };
            const lessonRef = attemptData.lessonInfo; 
            const lessonSnap = await getDoc(lessonRef);

            if (!lessonSnap.exists()) return;

            const lessonInfo: LessonType = {
                id: lessonSnap.id,
                ...(lessonSnap.data() as Omit<LessonType, "id">)
            };
        
            setLessonAttempt({
                id: snap.id,
                ...attemptData,
                lessonInfo,
            });
        });
      
        return () => unsub();
    }, [lessonID]);
    
    useEffect(() => {
        if (!lessonID || !lessonAttempt) return;
      
        const simDocRef = doc(
            db,
            "simulationLessonAttempts",
            lessonID,
            "simulations",
            `sim_${simulationIndex}`
        );
      
        async function ensureSimulationExists() {
            const snap = await getDoc(simDocRef);
            const data = snap.data();
        
            console.log("Simulation exists?", snap.exists());
            console.log("Generation status:", data?.generationStatus);
        
            if (snap.exists() && data?.generationStatus === "ready") {
                return;
            }
        
            if (!snap.exists()) {
                await setDoc(simDocRef, {
                generationStatus: "generating",
                completionStatus: "not begun",
                createdAt: new Date()
                });
            }
        
            const moduleAttemptRef = lessonAttempt?.moduleRef;
            if (!moduleAttemptRef) return;
        
            const moduleAttemptSnap = await getDoc(moduleAttemptRef);
            if (!moduleAttemptSnap.exists()) return;
        
            const moduleAttemptData = moduleAttemptSnap.data();
            const moduleInfoRef = moduleAttemptData.moduleInfo;
        
            const moduleInfoSnap = await getDoc(moduleInfoRef);
            if (!moduleInfoSnap.exists()) return;
        
            const moduleInfoData = moduleInfoSnap.data() as Omit<ModuleType, "id">;
        
            const lessonDifficulty = moduleInfoData.difficulty;
            const referenceIds =
                moduleInfoData.references?.map((ref: DocumentReference) => ref.id) ?? [];
        
            const workspaceRef = moduleInfoData.workspaceRef;
        
            const workspaceSnap = await getDoc(workspaceRef);
            if (!workspaceSnap.exists()) return;
        
            const storeRef = workspaceSnap.data().storeID;
            const storeSnap = await getDoc(storeRef);
            if (!storeSnap.exists()) return;
        
            const storeInfo = storeSnap.data();
        
            console.log("Calling backend...");
        
            await fetch("http://127.0.0.1:8000/ai/create-simulation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                workspace_id: workspaceRef.id,
                lesson_attempt_id: lessonID,
                sim_index: simulationIndex,
                store_info: storeInfo,
                lesson_title: lessonAttempt.lessonInfo.title,
                lesson_skills: lessonAttempt.lessonInfo.skills,
                lesson_difficulty: lessonDifficulty,
                lesson_abstract: lessonAttempt.lessonInfo.lessonAbstractInfo,
                reference_ids: referenceIds
                })
            });
        }
      
        ensureSimulationExists();
    }, [lessonID, simulationIndex, lessonAttempt]);


    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceLevel, setVoiceLevel] = useState(0);
    const speakAuto = async (rawText: any) => {
        try {

            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            
            setIsSpeaking(true);

            // const rawText = typeof message.content === "string" ? message.content : "";
            const text = rawText
                .replace(/\n{3,}/g, "\n\n")
                .replace(/\*\*([^*]+)\*\*/g, "$1")
                .replace(/\*([^*]+)\*/g, "$1")
                .replace(/__([^_]+)__/g, "$1")
                .replace(/_([^_]+)_/g, "$1")
                .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
                .trim();

            if (!text) return;

            const resp = await fetch("http://127.0.0.1:8000/ai/tts-elevenlabs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    voice_id: simData?.voice_id,
                    text
                })
            });

            if (!resp.ok) return;

            const url = URL.createObjectURL(await resp.blob());
            const audio = new Audio(url);
            audioRef.current = audio;

            const audioCtx = new AudioContext();
            const source = audioCtx.createMediaElementSource(audio);
            const analyser = audioCtx.createAnalyser();

            source.connect(analyser);
            analyser.connect(audioCtx.destination);

            analyser.fftSize = 256;
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const getVolume = () => {
                analyser.getByteFrequencyData(dataArray);
            
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
            
                const avg = sum / dataArray.length;
                const normalized = avg / 255;
            
                setVoiceLevel(normalized);
            
                requestAnimationFrame(getVolume);
            };

            audio.onended = () => {
                URL.revokeObjectURL(url);
                audioRef.current = null;
                setIsSpeaking(false);
                setVoiceLevel(0);
            };
            
            getVolume();
            await audio.play();

        } catch (e) {
            console.error("Auto speak error:", e);
        }
    };

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsSpeaking(false);
        setVoiceLevel(0);
    };
    
    const lastCharacterMessageRef = useRef<string | null>(null);
    useEffect(() => {
        if (!lessonID) return;
    
        const messagesRef = collection(
            db,
            "simulationLessonAttempts",
            lessonID,
            "simulations",
            `sim_${simulationIndex}`,
            "messages"
        );
    
        const unsub = onSnapshot(
            query(messagesRef, orderBy("timestamp")),
            (snap) => {
                const msgs = snap.docs.map(d => ({
                    id: d.id,
                    ...(d.data() as Omit<MessageType, "id">)
                }));
    
                setMessages(msgs);
    
                const last = msgs[msgs.length - 1];
    
                if (
                    last &&
                    last.role === "character" &&
                    last.id !== lastCharacterMessageRef.current
                ) {
                    setTypingMessageId(last.id);
                    lastCharacterMessageRef.current = last.id;
                }
            }
        );
    
        return () => unsub();
    }, [lessonID, simulationIndex, voiceMode, simData]);

    useEffect(() => {
        if (!lessonID) return;
    
        const simDocRef = doc(
            db,
            "simulationLessonAttempts",
            lessonID,
            "simulations",
            `sim_${simulationIndex}`
        );
    
        const unsub = onSnapshot(simDocRef, (snap) => {
            if (!snap.exists()) return;
    
            setSimData(snap.data()); 
        });
    
        return () => unsub();
    }, [lessonID, simulationIndex])

    const navigate = useNavigate();
    const handleBack = async () => {
        if (role === "employee") {

            const simDocRef = doc(
                db,
                "simulationLessonAttempts",
                lessonID!,
                "simulations",
                `sim_${simulationIndex}`
            );
    
            await updateDoc(simDocRef, {
                briefingCompleted: false,
            });

            navigate(`/employee/simulations/${moduleID}`);
            return;
        }
        navigate(`/employer/builder/${moduleID}`);
    };

    const handleNext = () => {
        if (role === "employee") {
            navigate(`/employee/simulations/${moduleID}/${lessonID}/${simulationIndex + 1}`);
        }
    };


    // const [productHints, setProductHints] = useState<any[]>([]);
    const handleUserSend = async (text: string) => {
        if (!lessonID) return;
    
        const messagesRef = collection(
            db,
            "simulationLessonAttempts",
            lessonID,
            "simulations",
            `sim_${simulationIndex}`,
            "messages"
        );
    
        const userDocRef = await addDoc(messagesRef, {
            role: "user",
            content: text,
            timestamp: serverTimestamp()
        });

        console.log(
            `lesson_attempt_id: ${lessonID},
            sim_index: ${simulationIndex},
            reply_to_id: ${userDocRef.id},
            latest_user_message: ${text},
            workspace_id: ${workspaceID}`
        );
  
        const response = await fetch("http://127.0.0.1:8000/ai/simulation-reply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                lesson_attempt_id: lessonID,
                sim_index: simulationIndex,
                reply_to_id: userDocRef.id,
                latest_user_message: text,
                workspace_id: workspaceID
            })
        });

        const data = await response.json();
        if (voiceMode) {
            speakAuto(data.characterReply);
        }

        const lessonAttemptRef = doc(db, "simulationLessonAttempts", lessonID);
        const lessonSnap = await getDoc(lessonAttemptRef);
        
        if (lessonSnap.exists()) {
            const data = lessonSnap.data();
        
            if (data.status === "not begun") {
                await updateDoc(lessonAttemptRef, {
                    status: "started"
                });
            }
        }
    };

    useEffect(() => {
        const fetchResources = async () => {
            if (!lessonAttempt) return;

            try {
            const moduleAttemptRef = lessonAttempt?.moduleRef;
            if (!moduleAttemptRef) return;
        
            const moduleAttemptSnap = await getDoc(moduleAttemptRef);
            if (!moduleAttemptSnap.exists()) return;
        
            const moduleAttemptData = moduleAttemptSnap.data();
            const moduleInfoRef = moduleAttemptData.moduleInfo;
        
            const moduleInfoSnap = await getDoc(moduleInfoRef);
            if (!moduleInfoSnap.exists()) return;
        
            const moduleInfoData = moduleInfoSnap.data() as Omit<ModuleType, "id">;
            setModuleTitle(moduleInfoData.title);
            const references = moduleInfoData.references;

            if (!references || references.length === 0) {
                setReferences([]);
                return;
            }
            
            const referenceSnapshots = await Promise.all(
                references.map(ref => getDoc(ref))
            );
            
            const referenceItems: ResourceItem[] = referenceSnapshots
                .filter(snap => snap.exists())
                .map(snap => ({
                    id: snap.id,
                    ...(snap.data() as Omit<ResourceItem, "id">)
                }));
            
            setReferences(referenceItems);
      
          } catch (err) {
            console.error("Error fetching resources:", err);
          }
        };
      
        fetchResources();
    }, [lessonAttempt]);

    const [refUrl, setRefUrl] = useState("");
    useEffect(() => {
        if (!selectedRef) return;

        if (selectedRef === null) {
            setRefUrl("");
        }

        const getRefUrl = async () => {
            const fileRef = ref(storage, selectedRef.filePath);
            const url = await getDownloadURL(fileRef);
            setRefUrl(url);
        }

        getRefUrl();
    }, [selectedRef]);

    const [phase, setPhase] = useState<"briefing" | "simulation" | null>(null);
    useEffect(() => {
        if (!simData) return;
        if (simData.generationStatus !== "ready") return;

        if (simData.briefingCompleted) {
            setPhase("simulation");
        } else {
            setPhase("briefing");
        }

    }, [simData]);

    if (authLoading) {
        return <LoadingPage />;
    }

    if (simulationLoading) {
        return <GenerationLoadingPage type={"simulation"} />
    }

    if (phase === "briefing") {
        return (
            <BriefingPage
                simIdx={simulationIndex}
                simData={simData}
                lessonAttempt={lessonAttempt}
                moduleTitle={moduleTitle}
                handleBack={handleBack}
                onStart={async () => {
                    const simDocRef = doc(
                        db,
                        "simulationLessonAttempts",
                        lessonID!,
                        "simulations",
                        `sim_${simulationIndex}`
                    );
    
                    await updateDoc(simDocRef, {
                        briefingCompleted: true,
                        completionStatus: "started"
                    });
    
                    setPhase("simulation");
                }}
            />
        );
    }

    return (
        <div className="sim-page-wrapper">
            { openModal && 
                <div className="attach-overlay">
                    <div className="attach-modal">
                        <div className="x-icon-wrapper">
                            View References
                            <div className="x-icon" onClick={() => {setOpenModal(false); setSelectedRef(null);}}>
                                <img src={x_icon} />
                            </div>
                        </div>
                        <div className="view-references-modal-wrapper">
                            <div className={`view-references-modal-body ${selectedRef ? "collapsed" : ""}`}>
                                {references.map(r => 
                                    <div className={`reference-item-wrapper ${r === selectedRef ? "selected" : ""}`} onClick={() => setSelectedRef(r)}>
                                        <span className="doc-icon builder">
                                            <img src={note_icon} />
                                        </span>
                                        <span className="doc-name">{r.title}</span>
                                    </div>
                                )}
                            </div>
                            { selectedRef &&
                                <div className="ref-viewer">
                                    {refUrl?.includes(".pdf") && (
                                        <>
                                        <iframe
                                            src={refUrl}
                                            title="PDF Preview"
                                        />
                                        </>
                                    )}
                    
                                    {refUrl &&
                                        (refUrl.includes(".png") ||
                                        refUrl.includes(".jpg") ||
                                        refUrl.includes(".jpeg") ||
                                        refUrl.includes(".webp")) && (
                                        <img
                                            src={refUrl}
                                            alt="Preview"
                                        />
                                        )}
                                </div>
                            }
                        </div>
                    </div>
                </div>
            }
            <div className={`simulation-page ${role}`}>
                    <div className="chat-section">
                        {(voiceMode) ?
                        (<VoiceMode 
                            key={`voice-${simulationIndex}`} 
                            title={lessonAttempt?.lessonInfo.title ?? ""} 
                            idx={simulationIndex}
                            lessonAttemptId={lessonID} 
                            simIndex={simulationIndex}
                            messages={messages ?? []} 
                            switchType={() => setVoiceMode(false)}
                            handleBack={handleBack} 
                            handleClick={(messageID: string) => {setSelectedMessage(messageID); setSelectOption("feedback");}}
                            handleSendMessage={handleUserSend} 
                            characterName={simData.characterName}
                            voiceDescription={simData?.voiceDescription} 
                            voiceId={simData?.voice_id}
                            isSpeaking={isSpeaking}
                            voiceLevel={voiceLevel}
                            onSpeak={(text) => speakAuto(text)}
                            onStop={stopAudio}
                        /> ) :
                        (<TypeMode 
                            key={`type-${simulationIndex}`} 
                            title={lessonAttempt?.lessonInfo.title ?? ""} 
                            idx={simulationIndex}
                            lessonAttemptId={lessonID} 
                            simIndex={simulationIndex} 
                            voiceDescription={simData?.voiceDescription}
                            voiceId={simData?.voice_id}
                            typingMessageId={typingMessageId} 
                            messages={messages ?? []} 
                            switchType={() => setVoiceMode(true)} 
                            handleSendMessage={handleUserSend} 
                            onTypingComplete={() => setTypingMessageId(null)}
                            handleBack={handleBack} handleClick={(messageID: string) => {setSelectedMessage(messageID); setSelectOption("feedback");}} name={simData.characterName} />)
                        }
                    </div>

                    <div className="sim-info">
                        <div className="info-body">
                            <div className={`select-panel ${selectOption}`}>
                                <div className="select-option premise" onClick={() => setSelectOption("premise")}>
                                    <div className="select-swap">
                                        <img className={`select-icon premise ${selectOption === "premise" && "selected"}`} src={black_lines_icon} />
                                        <img className={`select-icon premise ${selectOption !== "premise" && "unselected"}`} src={grey_lines_icon} />
                                    </div>
                                    <p>Premise</p>
                                </div>
                                <div className="select-option feedback" onClick={() => setSelectOption("feedback")}>
                                    <div className="select-swap">
                                        <img className={`select-icon feedback ${selectOption === "feedback" && "selected"}`} src={black_ai_icon} />
                                        <img className={`select-icon feedback ${selectOption !== "feedback" && "unselected"}`} src={grey_ai_icon} />
                                    </div>
                                    <p>Feedback</p>
                                </div>
                                <div className="selector" />
                            </div>
                                { (selectOption === "premise") ? 
                                    (<div className="premise-info">
                                        <h3>Meet {simData?.characterName}</h3>
                                        <p><span className="sim-prompt">Scenario Premise: </span> {simData?.premise}</p>
                                        <p className="sim-prompt">How would you approach this situation?</p>
                                    </div>) : 
                                    (messageInfo && feedbackInfo ? 
                                        (<div className="feedback-info">
                                            <div className="score-section">
                                                <p>Overall Score</p>
                                                <div className="rating-section">
                                                    <span className="msg-icon">
                                                        <img src={message_icon} />
                                                    </span>
                                                    <h3>{feedbackInfo?.rating}/10</h3>
                                                </div>
                                                <ProgressBar percent={feedbackInfo?.rating * 10} style1={true} hideCompletion={true} />
                                                <p className="score-content">{feedbackInfo?.content}</p>
                                            </div>
                                            { feedbackInfo?.strengths.length > 0 && 
                                            <div className="suggestion-section">
                                                <div className="suggestion-title">
                                                    <div className="green-dot" />
                                                    Strengths
                                                </div>
                                                
                                                {feedbackInfo?.strengths.map((s: any) => 
                                                    (<div className="strengths-card">
                                                        <div className="strengths-check">
                                                            ✓
                                                        </div>
                                                        <div className="strength-content">
                                                            <p className="strength-title">
                                                                {s.title}
                                                            </p>
                                                            <p className="strength-description">
                                                                {s.description}
                                                            </p>
                                                        </div>
                                                    </div>))}
                                            </div> }

                                            <div className="suggestion-section">
                                                <div className="suggestion-title">
                                                    <div className="blue-dot" />
                                                    Proposed Improvement
                                                </div>
                                                <div className="current-msg-wrapper">
                                                    <div className="current-msg">
                                                        <div className="current-msg-content">
                                                            {messageInfo?.content}
                                                        </div>
                                                    </div>
                                                    <div className="msg-label">Current</div>
                                                </div>
                                                <div className="suggesiton-thread-wrapper">
                                                    <div className="suggestion-thread-line" />
                                                </div>
                                                <div className="improved-msg-wrapper">
                                                    <div className="improved-msg">
                                                        <div className="blue-thing" />
                                                        <div className="improved-msg-content">
                                                            {feedbackInfo?.improved}
                                                        </div>
                                                    </div>
                                                    <div className="msg-label">
                                                        <span className="trend-icon">
                                                            <img src={blue_trend_icon} />
                                                        </span>
                                                        Improved
                                                    </div>
                                                </div>
                                            </div>
                                    </div>): (<div className="feedback-info empty">
                                        Select a message you sent to view feedback.
                                    </div>)) 
                                }
                        </div>
                        <div className="sim-action-panel">
                            <ActionButton text={"View Reference Materials"} buttonType={"read"} onClick={() => setOpenModal(true)} />
                            <div className={`action-wrap-sim ${role === "employer" ? "employer" : ""}`}>
                                {(simulationIndex < 2) && <ActionButton text={"Next Part"} buttonType={"play"} onClick={handleNext} />}
                            </div>
                        </div>
                    </div>          
            </div>
        </div>
    );
}

type BriefingPageProps = {
    simIdx: number;
    simData: any; 
    lessonAttempt: any;
    moduleTitle: string;
    onStart: () => void;
    handleBack: () => void;
};

function BriefingPage({ simIdx, simData, lessonAttempt, moduleTitle, onStart, handleBack }: BriefingPageProps) {
    
    const totalSimulations = 3;
    const buttonLabel = simData.completionStatus === "not begun" ? "Begin Simulation" : "Continue Simulation";

    return (
        <main className="briefing-page">
            <div className="brief-pg-top">
                <div className="back-to-lessons" onClick={handleBack}>
                    <img src={left_arrow} />
                </div>
                <div className="builder-page-title">
                    Simulation Modules / {moduleTitle} 
                    <span className="bold-txt blue-txt">/ Lesson {lessonAttempt.lessonInfo.orderNumber}</span>
                </div>
            </div>
            <div className="briefing-lesson-header-wrapper">
                <div className="briefing-lesson-header">
                    <p className="briefing-lesson-label">{lessonAttempt.lessonInfo.orderNumber}. Lesson</p>
                    <h3 className="briefing-lesson-title">{lessonAttempt.lessonInfo.title}</h3>
                    <div className="briefing-lesson-meta">
                        <div className="briefing lesson-skills time">
                            <span>
                                <img src={clock_icon} />
                            </span>
                            30 min
                        </div>
                        <div className="briefing lesson-skills">
                            <span>Skills</span>
                            {lessonAttempt.lessonInfo.skills.map((s: any) => (<SkillItem skill={s} role={"employee"} />))}
                        </div>
                    </div>
                </div>
                <ActionButton buttonType={"play"} text={buttonLabel} onClick={onStart} />
            </div>
            <div className="briefing-lesson-content">
                <div className="sim-progress">
                    {[...Array(totalSimulations)].map((_, i) => (
                        <div
                            key={i}
                            className={`dot ${i+1 === simIdx ? "active" : ""}`}
                        />
                    ))}

                    <span className="sim-text">
                        Simulation {simIdx} of {totalSimulations}
                    </span>
                </div>

                <div className="briefing-section">
                    <p className="briefing-content-label">Your Customer</p>
                    <div className="briefing-character-profile">
                        <div className="briefing-character-dp">
                            {simData.characterName?.charAt(0)}
                        </div>
                        <div className="briefing-character-name">
                            {simData.characterName}
                            <p className="briefing-character-label">Your Customer for this Simulation</p>
                        </div>
                    </div>
                </div>
                <div className="briefing-section">
                    <p className="briefing-content-label">Premise</p>
                    {simData.premise}
                </div>
                <div className="briefing-section briefing-goals">
                    <p className="briefing-content-label">Your Goals</p>
                    {simData.goals.map((g: any) => 
                        <div className="briefing-goal">
                            <div className="goals-check">
                                ✓
                            </div>
                            {g}
                        </div>
                    )}
                </div>
                <div className="briefing-section">
                    <p className="briefing-content-label">Approximate Time</p>
                    This simulation should ideally take  
                    <span className="bold-txt"> 10 minutes </span>. 
                    However, there is
                    <span className="bold-txt"> no set time limit</span>. 
                    You can take as long as you need to help your customer, within a reasonable time limit. 
                </div>
            </div>
            <div className="briefing-footer">
                <div className="briefing-meta">
                    <div className="briefing-meta-item">
                        <img src={voice_msg_icon} />
                        <span className="bold-txt">Voice simulation — speak directly with {simData.characterName}.</span> Audio is used only for transcription. Your voice recordings are not stored.
                    </div>
                    <div className="briefing-meta-item small-type">
                        <img src={keyboard_icon} />
                        Prefer typing? You can switch to text at any time during the simulation.
                    </div>
                </div>
            </div>
        </main>
    );
}