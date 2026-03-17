import './SimulationPage.css';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VoiceMode from './VoiceMode/VoiceMode';
import TypeMode from './TypeMode/TypeMode';
import ActionButton from '../../components/ActionButton/ActionButton';
import { collection, doc, query,  getDoc, setDoc, onSnapshot, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../firebase";
import { getDownloadURL, ref } from "firebase/storage";
import type { DocumentReference } from 'firebase/firestore';
import type { ResourceItem } from '../EmployerDashBoard/Resources/Resources';
import type { LessonAttemptType } from '../../types/Modules/Lessons/LessonAttemptType';
import type { ModuleType } from '../../types/Modules/ModuleType';
// dummy data
import { moduleAttempts } from '../../dummy_data/modulesAttempt_data';
import black_lines_icon from '../../assets/icons/simulations/black-lines-icon.svg';
import black_ai_icon from '../../assets/icons/simulations/black-ai-icon.svg';
import grey_lines_icon from '../../assets/icons/simulations/grey-lines-icon.svg';
import grey_ai_icon from '../../assets/icons/simulations/grey-ai-icon.svg';
import message_icon from '../../assets/icons/simulations/message-icon.svg';
import blue_trend_icon from '../../assets/icons/simulations/blue-trending-up-icon.svg';
import x_icon from '../../assets/icons/simulations/grey-x-icon.svg';
import note_icon from '../../assets/icons/orange-note-icon.svg';
import type { LessonType } from '../../types/Modules/Lessons/LessonType';
import type { MessageType } from '../../types/Modules/Lessons/Simulations/MessageType';
import { workspace } from '../../dummy_data/workspace_data';

export default function SimulationPage({ role, workspaceID }: { role: "employee" | "employer", workspaceID: string }) {
    const { moduleID, lessonID, simIdx } = useParams();
    const simulationIndex = Number(simIdx);

    const [lessonAttempt, setLessonAttempt] = useState<LessonAttemptType | null>(null);
    const [simData, setSimData] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const loading = !lessonAttempt || !simData || simData.generationStatus !== "ready";

    const [voiceMode, setVoiceMode] = useState(true);
    const [selectOption, setSelectOption] = useState<"premise" | "feedback">("premise");
    const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
    const messageInfo = selectedMessage !== null ? (messages?.find(m => selectedMessage === m.id)) ?? null : null;
    const feedbackInfo = selectedMessage !== null ? (messages?.find(m => selectedMessage === m.replyToId)) ?? null : null;
    const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [references, setReferences] = useState<ResourceItem[]>([]);
    const [selectedRef, setSelectedRef] = useState<ResourceItem | null>(null);

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
    }, [lessonID, simulationIndex]);

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
    const handleBack = () => {
        if (role === "employee") {
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

    const handleRead = () => {
    };

    const [productHints, setProductHints] = useState<any[]>([]);
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

        if (data.success) {
            setProductHints(data.productHints || []);
        }
    };

    console.log(productHints);

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

    console.log("typingMessageId:", typingMessageId);

    return (
        loading ?
            <div className="generating-pg">
                Generating your simulation...
            </div>
        : <div className="sim-page-wrapper">
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
                        (<VoiceMode key={`voice-${simulationIndex}`} title={lessonAttempt?.lessonInfo.title ?? ""} idx={simulationIndex}
                        lessonAttemptId={lessonID} simIndex={simulationIndex}
                        messages={messages ?? []} switchType={() => setVoiceMode(false)}
                        handleBack={handleBack} handleClick={(messageID: string) => {setSelectedMessage(messageID); setSelectOption("feedback");}}
                        handleSendMessage={handleUserSend} characterName={simData.characterName}
                        voiceDescription={simData?.premise} productHints={productHints} /> ) :
                        (<TypeMode key={`type-${simulationIndex}`} title={lessonAttempt?.lessonInfo.title ?? ""} idx={simulationIndex}
                        lessonAttemptId={lessonID} simIndex={simulationIndex} voiceDescription={simData?.premise}
                        typingMessageId={typingMessageId} productHints={productHints}
                        messages={messages ?? []} switchType={() => setVoiceMode(true)} handleSendMessage={handleUserSend} onTypingComplete={() => setTypingMessageId(null)}
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
                                    (messageInfo ? 
                                        (<div className="feedback-info">
                                            <div className="score-section">
                                                <p>Overall Score</p>
                                                <div className="rating-section">
                                                    <span className="msg-icon">
                                                        <img src={message_icon} />
                                                    </span>
                                                    <h3>{feedbackInfo?.rating}/10</h3>
                                                </div>
                                                <div className="score-divider" />
                                                <p className="score-content">{feedbackInfo?.content}</p>
                                            </div>
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