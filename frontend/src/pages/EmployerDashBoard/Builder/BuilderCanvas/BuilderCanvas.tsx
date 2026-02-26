import './BuilderCanvas.css';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, Spinner } from "@radix-ui/themes";
import ActionButton from '../../../../components/ActionButton/ActionButton';
import LessonCard from '../../../../cards/LessonCard/LessonCard';
import ChatBar from '../../../../components/ChatBar/ChatBar';
import ChatBubble from '../../../Simulation/ChatBubble/ChatBubble';
import { modules } from '../../../../dummy_data/modules_data';
import { doc, getDoc, updateDoc, collection, getDocs, where, query } from 'firebase/firestore';
import { ref, uploadBytes, deleteObject } from 'firebase/storage';
import { db } from '../../../../firebase';
import { onSnapshot } from "firebase/firestore";
import type { DocumentReference } from "firebase/firestore";
import { formatTimestampString } from '../../../../utils/Utils';
import type { MessageType } from '../../../../types/Modules/Lessons/Simulations/MessageType';
import type { ModuleType } from '../../../../types/Modules/ModuleType';
import type { LessonType } from '../../../../types/Modules/Lessons/LessonType';
import type { ResourceSection, ResourceItem } from '../../Resources/Resources';
import type { WorkspaceType } from '../../../../types/User/WorkspaceType';
import orange_left_arrow from '../../../../assets/icons/orange-left-arrow.svg';
import edit_icon from '../../../../assets/icons/simulations/grey-edit-icon.svg';
import refresh_icon from '../../../../assets/icons/simulations/grey-refresh-icon.svg';
import check_icon from '../../../../assets/icons/simulations/grey-check-icon.svg';
import cap_icon from '../../../../assets/icons/simulations/black-cap-icon.svg';
import white_plus_icon from '../../../../assets/icons/simulations/white-plus-icon.svg';
import blue_plus_icon from '../../../../assets/icons/simulations/blue-plus-icon.svg';
import x_icon from '../../../../assets/icons/simulations/grey-x-icon.svg';
import note_icon from '../../../../assets/icons/orange-note-icon.svg';
import file_icon from '../../../../assets/icons/simulations/grey-file-icon.svg';
import folder_icon from '../../../../assets/icons/simulations/grey-folder-icon.svg';
import white_ai_icon from '../../../../assets/icons/simulations/white-ai-icon.svg';
import orange_ai_icon from '../../../../assets/icons/simulations/orange-ai-icon.svg';

type BuilderCanvasProps = {
    id: string;
    workspace: WorkspaceType;
};

const resourceSections: ResourceSection[] = [
    {
        title: "Workplace Policies",
        icon: "🏢",
        tone: "policies",
        description: "Company-wide policies all employees must review",
        items: [],
    },
    {
        title: "HR & Forms",
        icon: "🧾",
        tone: "hr",
        description: "Forms for requests, documentation, and approvals",
        items: [],
    },
    {
        title: "Training & Operations",
        icon: "🎓",
        tone: "training",
        description: "Guidelines to support daily retail operations",
        items: [],
    },
    {
        title: "Safety & Compliance",
        icon: "🛡️",
        tone: "safety",
        description: "Safety instructions and emergency information",
        items: [],
    },
    {
        title: "Maps",
        icon: "🗺️",
        tone: "training",
        description: "Maps of the store",
        items: [],
    },
];

export default function BuilderCanvas({ id, workspace }: BuilderCanvasProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [module, setModule] = useState<ModuleType | null>(null);
    const [lessons, setLessons] = useState<LessonType[]>([]);
    const [lastModified, setLastModified] = useState(new Date().toISOString());

    useEffect(() => {
        async function fetchModule() {
            if (!id) return;
            setLoading(true);

            try {
                const moduleRef = doc(db, "simulationModules", id);
                const moduleSnap = await getDoc(moduleRef);

                if (!moduleSnap.exists()) {
                    console.error("Module data not found");
                    setLoading(false);
                    return;
                }

                let moduleData: ModuleType = {
                    id: moduleSnap.id,
                    ...(moduleSnap.data() as Omit<ModuleType, "id">)
                }

                setModule(moduleData);
                setLastModified(moduleData.lastModified || "");

                const lessonSnap = await getDocs(
                    query(
                        collection(db, "simulationLessons"),
                        where("moduleRef", "==", moduleRef)
                ));

                const lessonData: LessonType[] = lessonSnap.docs.map((docSnap) => ({
                    id: docSnap.id,
                    ...(docSnap.data() as Omit<LessonType, "id">),
                }));
                const sorted = lessonData.sort((a, b) => a.orderNumber - b.orderNumber);
                setLessons(sorted);

            } catch (error) {
                console.error("Error fetching module:", error)
            } finally {
                setLoading(false);
            }
        }

        fetchModule();

    }, [id]);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

    const [editMode, setEditMode] = useState(false);
    const [references, setReferences] = useState<DocumentReference[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [tempAttach, setTempAttach] = useState<string[]>([]); // change to File[]
    const [title, SetTitle] = useState(module?.title);
    const [userInput, setUserInput] = useState("");
    const [openAIPanel, setOpenAIPanel] = useState(false);
    const [chatMessages, setChatMessages] = useState<MessageType[]>([]);
    const [sections, setSections] = useState<ResourceSection[]>(resourceSections);
    const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
    const [stopTyping, setStopTyping] = useState(false);

    useEffect(() => {
        if (module) {
            SetTitle(module.title);
        }
    }, [module]);

    useEffect(() => {
        const fetchResources = async () => {
            if (!workspace?.id) return;
      
            try {
            const resourcesRef = collection(
                db,
                "workspaces",
                workspace.id,
                "resources"
            );
      
            const snapshot = await getDocs(resourcesRef);
      
            const fetchedResources: ResourceItem[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    filePath: data.filePath, 
                    section: data.section,
                };
            });
    
            setSections(prevSections =>
                prevSections.map(section => ({
                    ...section,
                    items: fetchedResources.filter(
                        r => r.section === section.title
                    )
                }))
            );
      
          } catch (err) {
            console.error("Error fetching resources:", err);
          }
        };
      
        fetchResources();
    }, [workspace]);

    useEffect(() => {
        if (module?.references) {
            setReferences(module.references);
        }
    }, [module]);    

    const handleAttachTemp = (resource: ResourceItem) => {
        const resourceRef = doc(
            db,
            "workspaces",
            workspace.id,
            "resources",
            resource.id
        );

        setReferences(prev => {
            const exists = prev.some(ref => ref.path === resourceRef.path);
        
            if (exists) {
                return prev.filter(ref => ref.path !== resourceRef.path);
            } else {
                return [...prev, resourceRef];
            }
        });

    };

    const handleAttach = async () => {
        try {
            const moduleRef = doc(db, "simulationModules", id);
            await updateDoc(moduleRef, {
              references: references
            });
            setOpenModal(false);
        
        } catch (error) {
            console.error("Error updating references:", error);
        }
    }
    
    const [isDeployed, setIsDeployed] = useState(module?.deployed);
    const [openDeployModal, setDeployModal] = useState(false);
    const [unDeployModal, setUnDeployModal] = useState(false);
    const handleDeploy = async () => {
        try {
            await handleSave(); 
            const moduleRef = doc(db, "simulationModules", id!);
            await updateDoc(moduleRef, {
                deployed: true,
            });
            setIsDeployed(true);
        } catch (error) {
            console.error("Error deploying module:", error);
        }
    };

    const handleRollBack = async () => {
        try {
            const moduleRef = doc(db, "simulationModules", id!);
            await updateDoc(moduleRef, {
                deployed: false,
            });
            setIsDeployed(false);
        } catch (error) {
            console.error("Error rolling back module:", error);
        }
    };

    const [saving, setSaving] = useState(false);
    const handleSave = async () => {
        if (!title || title.trim() === "") {
            console.error("Title cannot be empty");
            return;
        }
      
        try {
            setSaving(true);
            const moduleRef = doc(db, "simulationModules", id);
            const updatedLastModified = new Date().toISOString();

            await updateDoc(moduleRef, {
                title: title,
                lastModified: updatedLastModified, 
            });

            const lessonUpdatePromises = lessons.map(lesson => {
                const lessonRef = doc(db, "simulationLessons", lesson.id);
    
                return updateDoc(lessonRef, {
                    skills: lesson.skills,
                    allowUnlimitedAttempts: lesson.allowUnlimitedAttempts,
                    numAttempts: lesson.numAttempts ?? null,
                    criteria: lesson.criteria ?? [],
                    dueDate: lesson.dueDate ?? null,
                    customerMood: lesson.customerMood ?? 33,
                    lessonAbstractInfo: lesson.lessonAbstractInfo ?? null
                });
            });
    
            await Promise.all(lessonUpdatePromises);
      
            setLastModified(updatedLastModified);
            console.log("Module + lessons saved successfully!");
      
        } catch (error) {
            console.error("Error saving module:", error);
        } finally {
            setSaving(false);
        }
    };
      
    const [aiLoading, setAiLoading] = useState(false);
    const handleSend = async () => {
        if (!userInput.trim()) return;

        const userMessageContent = userInput;
        setUserInput("");
        setAiLoading(true);

        try {
            const res = await fetch("http://127.0.0.1:8000/ai/edit-module", {
                method: "POST", 
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    module_id: id,
                    user_message: userMessageContent,
                    context_scope: currentScope
                })
            });

            if (!res.ok) {
                throw new Error("AI request failed");
            }

        } catch(err) {
            console.error(err);
        } finally {
            setAiLoading(false);
            setUpdatingLessonIds([]);
        }
        
    };

    const transcriptRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = transcriptRef.current;
        if (!el) return;
      
        el.scrollTop = el.scrollHeight;
    }, [chatMessages]);

    useEffect(() => {
        if (!openAIPanel) return;
    
        requestAnimationFrame(() => {
            const el = transcriptRef.current;
            if (!el) return;
    
            el.scrollTop = el.scrollHeight;
        });
    }, [openAIPanel]);
    

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

    const updateLessonSkills = (lessonId: string, newSkills: string[]) => {
        setLessons(prev =>
            prev.map(l =>
                l.id === lessonId ? { ...l, skills: newSkills } : l
            )
        );
    };

    const updateLessonSettings = (lessonId: string, updates: Partial<LessonType>) => {
        setLessons(prev => prev.map(l =>
                l.id === lessonId ? { ...l, ...updates } : l
            )
        );
    };

    const updateDueDate = (lessonId: string, date: string | null) => {
        setLessons(prev => prev.map(l => 
            l.id === lessonId ? { ...l, dueDate: date } : l
        ));
    };

    // AI rendering
    useEffect(() => {
        if (!id) return;

        const refPath = collection(db, "simulationModules", id, "aiMessages");
    
        const unsubscribe = onSnapshot(refPath, (snapshot) => {
            const messages = snapshot.docs
                .map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        role: data.message?.role,
                        content: data.message?.content,
                        scope: data.message?.scope ?? [],
                        updates: data.updates ?? null,
                        createdAt: data.createdAt,
                        applied: data.applied ?? false
                    };
                })
                .filter(m => m.role && m.content)
                .sort((a, b) => {
                    const aTime = a.createdAt?.seconds || 0;
                    const bTime = b.createdAt?.seconds || 0;
                    return aTime - bTime;
                });
    
            setChatMessages(messages as any);

            const last = messages[messages.length - 1];

            if (last?.role === "assistant" && last?.updates?.lessons && !last.applied) {
                const updatedIds = last.updates.lessons
                    .map((l: any) => l.id)
                    .filter(Boolean);
    
                setUpdatingLessonIds(updatedIds);
            } else {
                setUpdatingLessonIds([]);
            }

            if (last?.role === "assistant" && typingMessageId === null && !last.applied) {
                setTypingMessageId(last.id);
                setStopTyping(false);
              }
        });
    
        return () => unsubscribe();
    }, [id]);
    
    const applyAIUpdates = (updates: any) => {
        if (!updates) return;
    
        if (updates.module && typeof updates.module === "object") {
            setModule(prev =>
                prev ? { ...prev, ...updates.module } : prev
            );
        }
    
        if (Array.isArray(updates.lessons)) {
            setLessons(prev =>
                prev.map(l => {
                    const updated = updates.lessons.find((u: any) => u.id === l.id);
                    if (!updated) return l;

                    const cleanedUpdate = Object.fromEntries(
                        Object.entries(updated).filter(([_, v]) => v !== null)
                    );
    
                    return { ...l, ...cleanedUpdate };
                })
            );
        }
    };

    const handleApply = async (messageId: string | null) => {
        if (messageId === null) return;

        try {
            const messageRef = doc(db, "simulationModules", id, "aiMessages", messageId);
    
            const snap = await getDoc(messageRef);
    
            if (!snap.exists()) return;
    
            const data = snap.data();
            const updates = data.updates;
    
            if (!updates) return;
            
            console.log("Applying updates:", updates);
            applyAIUpdates(updates);

            await updateDoc(messageRef, {
                applied: true
            });
    
        } catch (err) {
            console.error("Error applying AI updates:", err);
        }
    };

    const handleRestoreOriginal = async () => {
        const moduleRef = doc(db, "simulationModules", id);
        const snap = await getDoc(moduleRef);
    
        if (!snap.exists()) return;
    
        const base = snap.data().baseVersion;
        if (!base) return;
    
        const { lessons: baseLessons, ...moduleFields } = base;
    
        setModule(prev => prev ? { ...prev, ...moduleFields } : prev);
    
        if (Array.isArray(baseLessons)) {
            const sorted = [...baseLessons].sort(
                (a, b) => a.orderNumber - b.orderNumber
              );
              
            setLessons(sorted);
        }
    
        setUpdatingLessonIds([]);
    };

    const [updatingLessonIds, setUpdatingLessonIds] = useState<string[]>([]);

    const scrollToBottom = () => {
        const el = transcriptRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    };

    const bottomRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (!openAIPanel) return;
    
        bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }, [openAIPanel, chatMessages]);
    
    const [currentScope, setCurrentScope] = useState<string[]>([]);
    const lastMessage = chatMessages[chatMessages.length - 1];
    const canRegenerate = typingMessageId === null && !aiLoading && lastMessage?.role === "assistant";
      
    return (
        <div className="builder-canvas-page">
            {(openModal) && <div className="attach-overlay">
                    <div className="attach-modal">
                        <div className="x-icon-wrapper">
                            Select Documents to Attach
                            <div className="x-icon" onClick={() => setOpenModal(false)}>
                                <img src={x_icon} />
                            </div>
                        </div>
                        <div className="attach-content-wrapper">   
                            {sections.map((section) => (
                            <div
                                key={section.title}
                                className={`resource-card ${section.tone} builder`}
                            >
                                <div className="card-header">
                                <h3>
                                    <span className={`section-icon ${section.tone}`}>
                                    {section.icon}
                                    </span>
                                    {section.title}
                                </h3>
                                <p>{section.description}</p>
                                </div>

                                <ul className="resource-list">
                                {section.items.map((item, idx) => (
                                    <li key={idx} className="resource-item">
                                    <span className="doc-icon builder">
                                        <img src={note_icon} />
                                    </span>
                                    <span className="doc-name">{item.title}</span>
                                    <button className={`attach-btn ${(references.some(ref => ref.id === item.id)) ? "attached" : ""}`} onClick={() => handleAttachTemp(item)}>
                                        {(references.some(ref => ref.id === item.id)) ? "Attached" : "Attach"}
                                    </button>
                                    </li>
                                ))}
                                </ul>
                            </div>
                            ))}
                        </div>
                        <div className="attach-action-panel">
                            <ActionButton text="Attach References" buttonType="attach"
                            onClick={handleAttach} />
                        </div>
                    </div>
                </div>}
            
            {(unDeployModal) && <div className="delete-modal-overlay">
            <div className="delete-modal">
                <h3>Unpublish this module?</h3>
                <p>This module will no longer be accessible to employees. Progress data will be preserved.</p>
                    <div className="delete-modal-actions">
                        <button className="cancel-btn" onClick={() => setUnDeployModal(false)}>
                            Cancel
                        </button>
                        <button className="delete-btn" onClick={() => {handleRollBack(); setUnDeployModal(false);}}>
                            Unpublish
                        </button>
                    </div>
                </div>
            </div>}

            {(openDeployModal) && <div className="delete-modal-overlay">
            <div className="delete-modal">
                <h3>Deploy this module?</h3>
                <p>This module will become visible to employees. Any enrolled users will be able to access it immediately.</p>
                    <div className="delete-modal-actions">
                        <button className="cancel-btn" onClick={() => setDeployModal(false)}>
                            Cancel
                        </button>
                        <button className="delete-btn" onClick={() => {handleDeploy(); setDeployModal(false);}}>
                            Deploy
                        </button>
                    </div>
                </div>
            </div>}

            <div className="canvas-main-wrapper">
                <div className="canvas-main">
                    <div className="canvas-main-top">
                        <Tooltip content="Back">
                            <div className="back-to-modules builder" onClick={() => navigate(`/employer/modules`)}>
                                <img src={orange_left_arrow} />
                            </div>
                        </Tooltip>
                        <div className="modules-header lesson-pg">
                            <div className="builder-header-wrapper">
                                <div className="builder-page-title">
                                    { aiLoading ? 
                                    <div className="updating-spinner">
                                        <Spinner size="2" /> 
                                        Cognition is updating this module...
                                    </div> : 
                                    "Builder Studio / Simulation Modules"}
                                </div>
                                {editMode ? 
                                    <div className="title-input-wrapper">
                                        <span className="edit-mode-icon">
                                            <img src={edit_icon} />
                                        </span>
                                        <div className="title-input">
                                            <input type="text" placeholder="Enter new title" value={title} onChange={(e) => SetTitle(e.target.value)} />
                                        </div>
                                    </div>
                                : <h1>{title}</h1>}
                            </div>
                            <div className="global-action-panel">
                                <Tooltip content={editMode ? "Save edits" : "Edit title"}>
                                    <div className="builder-action" onClick={() => setEditMode(prev => !prev)}>
                                        <img src={editMode ? check_icon : edit_icon} />
                                    </div>
                                </Tooltip>
                                <Tooltip content="Restore original">
                                    <div className="builder-action" onClick={handleRestoreOriginal}>
                                        <img src={refresh_icon} />
                                    </div>
                                </Tooltip>
                                <div className="builder-action-pill" onClick={() => setOpenModal(true)}>
                                    <span>
                                        <img src={folder_icon} />
                                    </span>
                                    View References {/* In the backend I'll make it so the attached files show "attached" */}
                                </div>
                                <div className="builder-action-pill" onClick={handleSave}>
                                    <span>
                                        <img src={file_icon} />
                                    </span>
                                    {saving ? "Saving..." : "Save as Draft"}
                                </div>
                                <ActionButton text={"Deploy"} buttonType={"deploy"} onClick={() => {if (!isDeployed) {setDeployModal(true);} else {setUnDeployModal(true);}}} disabled={isDeployed} />
                            </div>
                        </div>
                        <div className="module-info-builder">
                            <div className="module-info-line">
                                <span className="module-info-label">LAST MODIFIED</span>
                                <p className="module-info-value">{formatTimestampString(lastModified)}</p>
                            </div>

                            <div className="module-info-line">
                                <span className="module-info-label">DIFFICULTY</span>
                                <div className={`module-info-value difficulty-pill ${module?.difficulty}`}>{module?.difficulty}</div> {/*lets say this is calculated by lesson info*/}
                            </div>

                            <div className="module-info-line">
                                <span className="module-info-label">TOTAL LESSONS</span>
                                <p className="module-info-value">{lessons?.length} lessons</p> 
                            </div>
                            <div className="builder-filler-space" />
                        </div>
                    </div>
                    {/*<div className="module-info-line lesson">
                        <span className="module-info-icon">
                            <img src={folder_icon} />
                        </span>
                        <span className="module-info-label">REFERENCES</span>
                    </div>
                    <div className="attached-references-wrapper">
                        <div className="attached-references" >
                            {references?.map((f) => <AttachmentItem fileName={f} onClick={() => handleRemoveReference(f)} />)}
                            <div className="plus-wrapper">
                                <div className="builder-action" onClick={() => setOpenModal(true)}>
                                    <img src={plus_icon} />
                                </div>
                            </div>
                        </div>
                    </div>*/}
                    <div className="module-lessons-wrapper">
                        <div className="lesson-title-wrapper">
                            <div className="module-info-line lesson">
                                <span className="module-info-icon">
                                    <img src={cap_icon} />
                                </span>
                                <span className="module-info-label lesson">LESSONS</span>
                            </div>
                            <button className="add-lesson-btn">
                                <div className="add-icon-swap">
                                    <img className="add-icon default" src={white_plus_icon} />
                                    <img className="add-icon hover" src={blue_plus_icon} />
                                </div>
                                Add Lesson
                            </button>
                        </div> 
                        <div className="lessons-list">
                            {lessons?.map((l) => 
                                (<LessonCard 
                                    lessonInfo={l} 
                                    role={"employer"} 
                                    moduleID={id}
                                    //isUpdating={updatingLessonIds.includes(l.id)}
                                    onSkillsChange={(newSkills) => updateLessonSkills(l.id, newSkills)}
                                    onSettingsChange={(newSettings) => updateLessonSettings(l.id, newSettings)}
                                    onDueDateChange={(newDueDate) => updateDueDate(l.id, newDueDate)}
                                />))}
                        </div>
                        {/*<div className="builder-action-panel">
                            <ActionButton text={"Save as Draft"} buttonType={"save"} onClick={handleSave} reversed={true} />
                            <ActionButton text={"Deploy"} buttonType={"deploy"} onClick={handleDeploy} disabled={module?.deployed} />
                        </div>*/}
                        <div className="filler-space" />
                    </div>
                    { !openAIPanel &&
                    <Tooltip content="AI assistant">
                        <div className="open-ai-toggle" onClick={() => setOpenAIPanel(prev => !prev)}>
                            <img src={white_ai_icon} />
                        </div>
                    </Tooltip>}
                </div>
                { openAIPanel &&
                <div className="ai-side-panel">
                    <div className="x-icon-wrapper panel">
                        <div className="ai-panel-title">
                            <span>
                                <img src={orange_ai_icon} />
                            </span>
                            Cognition AI
                        </div>
                        <div className="x-icon" onClick={() => setOpenAIPanel(false)}>
                            <img src={x_icon} />
                        </div>
                    </div>
                    <div className="ai-panel-chat-space" ref={transcriptRef}>
                            {chatMessages.length === 0 && <div className="scroll-spacer" />}
                            {chatMessages.map((m, i, arr) => {
                            const isLast = i === arr.length - 1;
                            const shouldType = m.role === "assistant" && m.id === typingMessageId;
                            return (<ChatBubble key={m.id} message={m} shouldType={shouldType} stopTyping={stopTyping} onTypingComplete={() => {setTypingMessageId(null); setStopTyping(false);}}
                            className={isLast ? "last-message" : i === 0 ? "first-message" : ""} onTypingUpdate={scrollToBottom} lessons={lessons} handleApply={() => handleApply(m.id)} shouldRegenerate={canRegenerate} />)})}
                            <div ref={bottomRef} />
                    </div>
                    <div className="builder-chat-wrapper">
                        {aiLoading && <div className="ai-loading-text">Cognition AI is applying changes...</div>}
                        <ChatBar context={"module"} userInput={userInput} setUserInput={setUserInput} handleSend={handleSend} 
                        pageContext={[
                            { id: "module", label: "Module Base", isModule: true },
                            ...(lessons ?? []).map(l => ({
                                id: l.id,
                                label: l.title,
                                isModule: false
                            }))
                        ]}
                         typingMessageId={typingMessageId} 
                        handleStop={() => {setStopTyping(true); setTypingMessageId(null);}} setCurrentScope={setCurrentScope} /> 
                    </div>
                </div>
                }
            </div>
        </div>
    );
}