import './Builder.css';
import { useState, useEffect } from 'react';
import { Tooltip } from "@radix-ui/themes";
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs, where, query, onSnapshot, DocumentReference, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../firebase';
import ChatBar from '../../../components/ChatBar/ChatBar';
import AttachmentItem from '../../../components/AttachmentItem/AttachmentItem';
import BuilderCanvas from './BuilderCanvas/BuilderCanvas';
import type { ResourceSection, ResourceItem } from '../Resources/Resources';
import type { WorkspaceType } from '../../../types/User/WorkspaceType';
import orange_left_arrow from '../../../assets/icons/orange-left-arrow.svg';
import ai_icon from '../../../assets/icons/simulations/grey-ai-icon.svg';
import x_icon from '../../../assets/icons/simulations/grey-x-icon.svg';
import note_icon from '../../../assets/icons/orange-note-icon.svg';
import GenerationLoadingPage from '../../LoadingPages/GenerationLoading/GenerationLoadingPage';

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


export default function Builder({ workspace }: { workspace: WorkspaceType }) {
    const navigate = useNavigate();
    const { moduleID } = useParams();
    const isNewDraft = !moduleID;
    const [openModal, setOpenModal] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
    const [references, setReferences] = useState<{
        id: string;
        title: string;
        ref: DocumentReference;
    }[]>([]);
    const [sections, setSections] = useState<ResourceSection[]>(resourceSections);
    const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
    const [stopTyping, setStopTyping] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

    useEffect(() => {
        const fetchResources = async () => {
            const resourcesRef = collection(
                db,
                "workspaces",
                workspace.id,
                "resources"
            );
    
            const snapshot = await getDocs(resourcesRef);
            const fetchedResources = snapshot.docs.map(doc => {
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
        };
    
        fetchResources();
    }, [workspace]);

    const handleSend = async () => {
        if (!userInput.trim()) return;

        try {
            setAiLoading(true);

            const moduleRef = doc(collection(db, "simulationModules"));

            await setDoc(moduleRef, {
                title: "Generating...",
                difficulty: null,
                description: "",
                deployed: false,
                workspaceRef: doc(db, "workspaces", workspace.id),
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                references: references.map(r => r.ref),
                numLessons: 3,
                hours: "1:30"
            });

            await updateDoc(doc(db, "workspaces", workspace.id), {
                simulationModules: arrayUnion(moduleRef)
            })

            const res = await fetch("http://127.0.0.1:8000/ai/create-module", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    module_id: moduleRef.id,
                    user_message: userInput,
                    reference_ids: references.map(r => r.id)
                })
            })

            if (!res.ok) {
                throw new Error("AI module generation failed")
            }

            navigate(`/employer/modules/builder/${moduleRef.id}`)
        } catch (err) {
            console.error("Error generating module:", err)
        } finally {
            setAiLoading(false);
        }
    };

    const handleAttachTemp = (resource: ResourceItem) => {
        const resourceRef = doc(
            db,
            "workspaces",
            workspace.id,
            "resources",
            resource.id
        );
    
        setReferences(prev => {
            const exists = prev.some(r => r.id === resource.id);
    
            if (exists) {
                return prev.filter(r => r.id !== resource.id);
            } else {
                return [
                    ...prev,
                    {
                        id: resource.id,
                        title: resource.title,
                        ref: resourceRef
                    }
                ];
            }
        });
    };

    /*const handleAttach = async () => {
        try {
            const moduleRef = doc(db, "simulationModules", id);
            await updateDoc(moduleRef, {
              references: references
            });
            setOpenModal(false);
        
        } catch (error) {
            console.error("Error updating references:", error);
        }
    }*/

    const handleRemoveFile = (id: string) => {
        setReferences(prev => prev.filter(r => r.id !== id));
    };

    const tempUserInput = "I want to create a retail training simulation module focused on increasing in-store sales through better customer service and strategic selling techniques."
    const tempReferences = [
        {
            id: "1",
            title: "File 1"
        },
        {
            id: "2",
            title: "File 2"
        },
        {
            id: "3",
            title: "File 3"
        },
        {
            id: "4",
            title: "File 4"
        },
        {
            id: "5",
            title: "File 5"
        },
        {
            id: "6",
            title: "File 6"
        },
        {
            id: "7",
            title: "File 7"
        }
    ];

    return (
        <> { (isNewDraft) ? 
            (<div className="builder-page">
                {(openModal) && <div className="attach-overlay">
                    <div className="attach-modal">
                        <div className="x-icon-wrapper">
                            Select Documents to Attach
                            <div className="x-icon" onClick={() => {setOpenModal(false); setAttachedFiles([]);}}>
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
                    </div>
                </div>}
                <Tooltip content="Go back">
                    <div className="back-to-modules builder" onClick={() => navigate(`/employer/modules`)}>
                        <img src={orange_left_arrow} />
                    </div>
                </Tooltip>
                {<div className="builder-hero">
                    {aiLoading ?
                    < GenerationLoadingPage type={"module"} />
                    : <>
                        <h3>Welcome To</h3>
                        <h3>Builder Canvas</h3>
                    </>}

                    <div className={`builder-desc ${aiLoading ? "generating-text" : ""}`}>
                        { aiLoading ? 
                        <p> Cadence is structuring lessons, crafting scenarios, and aligning your references...</p>
                        : <>
                            <span>
                                <img src={ai_icon} />
                            </span>
                            <p>Start by pitching a Simulation Idea to Cadence, our AI Assistant</p>
                        </>}
                    </div>
                </div>}
                {aiLoading &&
                <div className="user-input-bubble-wrapper">
                    <div className="attached-items-wrapper-sent">
                        {references?.map((f) => <AttachmentItem key={f.id} fileName={f.title} onClick={() => handleRemoveFile?.(f.id)} isStatic={true} />)}
                    </div>
                    <div className="user-input-bubble">
                        {userInput}
                    </div>
                </div>}
                <div className="chatbar-wrapper">
                    {!aiLoading &&
                    <ChatBar context="builder" userInput={userInput} setUserInput={setUserInput} 
                    handleSend={handleSend} handleAttach={() => setOpenModal(true)}
                    attachedFiles={references} showFileCond={!openModal} 
                    handleRemoveFile={handleRemoveFile} 
                    typingMessageId={typingMessageId} 
                    handleStop={() => {setStopTyping(true); setTypingMessageId(null);}} />}
                </div>
            </div> ) :
            (
             <BuilderCanvas id={moduleID} workspace={workspace} />
            )
        } </>
    );
}