import './BuilderCanvas.css';
import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, Spinner, Checkbox } from "@radix-ui/themes";
import ActionButton from '../../../../components/ActionButton/ActionButton';
import LessonCard from '../../../../cards/LessonCard/LessonCard';
import ChatBar from '../../../../components/ChatBar/ChatBar';
import ChatBubble from '../../../Simulation/ChatBubble/ChatBubble';
import { doc, getDoc, updateDoc, collection, getDocs, where, query, onSnapshot, DocumentReference, addDoc, orderBy } from 'firebase/firestore';
import { db, storage } from '../../../../firebase';
import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { formatTimestampString } from '../../../../utils/Utils';
import type { MessageType } from '../../../../types/Modules/Lessons/Simulations/MessageType';
import type { ModuleType } from '../../../../types/Modules/ModuleType';
import type { LessonType } from '../../../../types/Modules/Lessons/LessonType';
import type { ResourceSection, ResourceItem } from '../../Resources/Resources';
import type { WorkspaceType } from '../../../../types/User/WorkspaceType';
import type { EmployeeUserType } from '../../../../types/User/UserType';
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
import undo_icon from '../../../../assets/icons/grey-undo-icon.svg';
import upload_icon from '../../../../assets/icons/file-upload-icon.svg';
import search_icon from '../../../../assets/icons/lesson-edit/grey-search.svg';
import default_icon from '../../../../assets/icons/default-icon.svg';
import users_icon from '../../../../assets/icons/grey-users-icon.svg';

const MODULE_HEADER_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

function extFromImageFile(file: File): string {
    if (file.type === "image/png") return "png";
    if (file.type === "image/webp") return "webp";
    if (file.type === "image/gif") return "gif";
    return "jpg";
}

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
    const [applied, setApplied] = useState(false);

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
                setHeaderImageUrl(moduleData.headerImageUrl);
                setHeaderImageStoragePath(moduleData.headerImageStoragePath);
                setRemoveCustomHeader(false);
                setPendingHeaderFile(null);
                setHeaderObjectUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return null;
                });

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
    const [deleteModalInput, setDeleteModalInput] = useState("");
    const [deleteModal, setDeleteModal] = useState(false);
    const [assignModal, setAssignModal] = useState(false);

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

    useEffect(() => {
        if (module?.deployed !== undefined) {
          setIsDeployed(module.deployed);
        }
    }, [module]);

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

    const [isDeleting, setIsDeleting] = useState(false);
    const handleDeleteModule = async () => {

        if (isDeleting) return;
        setIsDeleting(true);
        try {
            const moduleRef = doc(db, "simulationModules", id!);
            await updateDoc(moduleRef, {
                deployed: false,
                isDeleted: true,
            });
            navigate(`/employer/modules`, {
                state: { moduleDeleted: true }
            });
        } catch (error) {
            console.error("Error deleting module:", error);
        }
    }

    const [headerImageUrl, setHeaderImageUrl] = useState<string | undefined>(undefined);
    const [headerImageStoragePath, setHeaderImageStoragePath] = useState<string | undefined>(undefined);
    const [pendingHeaderFile, setPendingHeaderFile] = useState<File | null>(null);
    const [headerObjectUrl, setHeaderObjectUrl] = useState<string | null>(null);
    const [removeCustomHeader, setRemoveCustomHeader] = useState(false);

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

            let resolvedHeaderUrl = headerImageUrl;
            let resolvedHeaderPath = headerImageStoragePath;

            if (removeCustomHeader && headerImageStoragePath) {
                try {
                    await deleteObject(ref(storage, headerImageStoragePath));
                } catch (e) {
                    console.warn("Could not delete previous module header:", e);
                }
                resolvedHeaderUrl = undefined;
                resolvedHeaderPath = undefined;
                setHeaderImageUrl(undefined);
                setHeaderImageStoragePath(undefined);
                setRemoveCustomHeader(false);
            } else if (pendingHeaderFile) {
                if (headerImageStoragePath) {
                    try {
                        await deleteObject(ref(storage, headerImageStoragePath));
                    } catch (e) {
                        console.warn("Could not delete replaced module header:", e);
                    }
                }
                const ext = extFromImageFile(pendingHeaderFile);
                const storagePath = `moduleHeaders/${workspace.id}/${id}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
                const sref = ref(storage, storagePath);
                await uploadBytes(sref, pendingHeaderFile);
                resolvedHeaderUrl = await getDownloadURL(sref);
                resolvedHeaderPath = storagePath;
                setHeaderImageUrl(resolvedHeaderUrl);
                setHeaderImageStoragePath(resolvedHeaderPath);
                setPendingHeaderFile(null);
                setHeaderObjectUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return null;
                });
            }

            await updateDoc(moduleRef, {
                title: title,
                lastModified: updatedLastModified,
                headerImageUrl: resolvedHeaderUrl ?? null,
                headerImageStoragePath: resolvedHeaderPath ?? null,
            });

            const lessonUpdatePromises = lessons.map(async (lesson) => {
                if (lesson.isNew) {
                    const docRef = await addDoc(collection(db, "simulationLessons"), {
                        title: lesson.title,
                        skills: lesson.skills ?? [],
                        allowUnlimitedAttempts: lesson.allowUnlimitedAttempts ?? null,
                        numAttempts: lesson.numAttempts ?? null,
                        criteria: lesson.criteria ?? [],
                        dueDate: lesson.dueDate ?? null,
                        customerMood: lesson.customerMood ?? 33,
                        lessonAbstractInfo: lesson.lessonAbstractInfo ?? null,
                        moduleRef: moduleRef, 
                        orderNumber: lesson.orderNumber
                    });
            
                    lesson.id = docRef.id;
                    lesson.isNew = false;
            
                    return;
                }
            
                const lessonRef = doc(db, "simulationLessons", lesson.id);
            
                await updateDoc(lessonRef, {
                    skills: lesson.skills ?? [],
                    allowUnlimitedAttempts: lesson.allowUnlimitedAttempts ?? null,
                    numAttempts: lesson.numAttempts ?? null,
                    criteria: lesson.criteria ?? [],
                    dueDate: lesson.dueDate ?? null,
                    customerMood: lesson.customerMood ?? 33,
                    lessonAbstractInfo: lesson.lessonAbstractInfo ?? null,
                    orderNumber: lesson.orderNumber
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

        if (isAddingLesson) {
            try {
                setChatMessages((prev) => prev.slice(0, -2));

                const res = await fetch("http://127.0.0.1:8000/ai/create-lesson", {
                    method: "POST",
                    body: JSON.stringify({
                        module_id: id,
                        user_message: userMessageContent,
    
                    }),
                    headers: { "Content-Type": "application/json" }
                });
    
                if (!res.ok) {
                    throw new Error("AI request failed");
                }
            } catch(err) {
                console.error(err);
            } finally {
                setAiLoading(false);
            }

            setIsAddingLesson(false);
            return;
        }   

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

    const handleRegenerate = async (assistantMessage: any) => {
        if (aiLoading || typingMessageId !== null) return;
    
        const assistantIndex = chatMessages.findIndex(msg => msg.id === assistantMessage.id);
        if (assistantIndex <= 0) return;

        const previousUserMessage = [...chatMessages].slice(0, assistantIndex).reverse().find(msg => msg.role === "user");
        if (!previousUserMessage) return;
    
        setAiLoading(true);
    
        try {
            const isNewLesson = !!assistantMessage.newLesson;

            const endpoint = isNewLesson
            ? "http://127.0.0.1:8000/ai/create-lesson"
            : "http://127.0.0.1:8000/ai/edit-module";

            const body = isNewLesson
            ? {
                  module_id: id,
                  user_message: previousUserMessage.content
              }
            : {
                  module_id: id,
                  user_message: previousUserMessage.content,
                  context_scope: previousUserMessage.scope ?? currentScope
              };

            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body)
            });
    
            if (!res.ok) {
                throw new Error("AI regenerate failed");
            }
    
        } catch (err) {
            console.error("Error regenerating:", err);
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
    /* useEffect(() => {
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
                    if (!a.createdAt && !b.createdAt) return 0;
                    if (!a.createdAt) return 1;  
                    if (!b.createdAt) return -1;

                    return a.createdAt.seconds - b.createdAt.seconds;
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
    }, [id]); */

    useEffect(() => {
        if (!id) return;
    
        const q = query(
            collection(db, "simulationModules", id, "aiMessages"),
            orderBy("createdAt", "asc")
        );
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs
                .map((doc, index) => {
                    const data = doc.data();
    
                    return {
                        id: doc.id,
                        role: data.message?.role,
                        content: data.message?.content,
                        scope: data.message?.scope ?? [],
                        updates: data.updates ?? null,
                        newLesson: data.newLesson ?? null,
                        createdAt: data.createdAt ?? null,
                        applied: data.applied ?? false,
                        _index: index
                    };
                })
                .filter(m => m.role && m.content)
                .sort((a, b) => {
                    const aTime = a.createdAt
                        ? a.createdAt.seconds * 1e9 + (a.createdAt.nanoseconds || 0)
                        : Infinity;
    
                    const bTime = b.createdAt
                        ? b.createdAt.seconds * 1e9 + (b.createdAt.nanoseconds || 0)
                        : Infinity;
    
                    if (aTime !== bTime) return aTime - bTime;
    
                    return a._index - b._index;
                });
    
            setChatMessages(messages as any);
    
            const last = messages[messages.length - 1];
    
            if (
                last?.role === "assistant" &&
                last?.updates?.lessons &&
                !last.applied
            ) {
                const updatedIds = last.updates.lessons
                    .map((l: any) => l.id)
                    .filter(Boolean);
    
                setUpdatingLessonIds(updatedIds);
            } else {
                setUpdatingLessonIds([]);
            }
    
            if (
                last?.role === "assistant" &&
                typingMessageId === null &&
                !last.applied
            ) {
                setTypingMessageId(last.id);
                setStopTyping(false);
            }
        });
    
        return () => unsubscribe();
    }, [id]); 

    const deepCleanNulls = (obj: any): any => {
        if (obj === null) return undefined;
      
        if (Array.isArray(obj)) {
            return obj
                .map(deepCleanNulls)
                .filter(v => v !== undefined);
        }
      
        if (typeof obj === "object" && obj !== undefined) {
            return Object.fromEntries(
                Object.entries(obj)
                    .map(([k, v]) => [k, deepCleanNulls(v)])
                    .filter(([_, v]) => v !== undefined)
            );
        }
      
        return obj;
    };
    
    const applyAIUpdates = (updates: any) => {
        if (!updates) return;

        if (updates.module && typeof updates.module === "object") {
            const cleanedModule = deepCleanNulls(updates.module);
        
            setModule(prev =>
                prev ? { ...prev, ...cleanedModule } : prev
            );
        }

        if (Array.isArray(updates.lessons)) {
          setLessons(prev =>
            prev.map(l => {
                const updated = updates.lessons.find((u: any) => u.id === l.id);
                if (!updated) return l;
        
                const cleanedUpdate = deepCleanNulls(updated);
        
                if (cleanedUpdate.lessonAbstractInfo) {
                    cleanedUpdate.lessonAbstractInfo = {
                        ...l.lessonAbstractInfo,
                        ...cleanedUpdate.lessonAbstractInfo
                    };
                }
        
                return { ...l, ...cleanedUpdate };
            })
          );
        }
    };

    const handleApply = async (messageId: string | null) => {
        if (messageId === null) return;

        try {
            setApplied(true);
            const messageRef = doc(db, "simulationModules", id, "aiMessages", messageId);
    
            const snap = await getDoc(messageRef);
    
            if (!snap.exists()) return;
    
            const data = snap.data();
            if (data.applied) return;

            const updates = data.updates;
            const newLesson = data.newLesson;

            setPreviousSnapshot({
                module: module ? { ...module } : null,
                lessons: lessons.map(l => ({ ...l }))
            });

            if (newLesson) {
                const cleanedLesson = deepCleanNulls(newLesson);
    
                setLessons(prev => {
                    let updated = [...prev];
    
                    const last = updated[updated.length - 1];
                    if (last?.isNew) {
                        updated.pop();
                    }
                    
                    updated.push({
                        ...cleanedLesson,
                        id: `temp-${Date.now()}`,
                        orderNumber: updated.length + 1,
                        isNew: true
                    });
    
                    return updated;
                });
            }
            
            if (updates) {
                applyAIUpdates(updates);
            }

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

    const handleRestorePrevious = () => {
        if (!previousSnapshot) return;
    
        setModule(previousSnapshot.module);
        setLessons(previousSnapshot.lessons);
    
        setPreviousSnapshot(null); 
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
    const [previousSnapshot, setPreviousSnapshot] = useState<{
        module: ModuleType | null;
        lessons: LessonType[];
    } | null>(null);

    const onModuleHeaderFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!MODULE_HEADER_IMAGE_TYPES.includes(file.type as (typeof MODULE_HEADER_IMAGE_TYPES)[number])) {
            return;
        }
        setRemoveCustomHeader(false);
        setPendingHeaderFile(file);
        setHeaderObjectUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(file);
        });
        e.target.value = "";
    };

    const clearModuleHeader = () => {
        setRemoveCustomHeader(true);
        setPendingHeaderFile(null);
        setHeaderObjectUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
        });
    };

    useEffect(() => {
        return () => {
            if (headerObjectUrl) URL.revokeObjectURL(headerObjectUrl);
        };
    }, [headerObjectUrl]);

    const moduleHeaderPreviewSrc =
        removeCustomHeader ? undefined : (headerObjectUrl ?? headerImageUrl);

    
    const [isAddingLesson, setIsAddingLesson] = useState(false);
    const handleAddLesson = async () => {
        setOpenAIPanel(true);
        setIsAddingLesson(true);
        const newId = String(Date.now());
        setTypingMessageId(newId);

        setChatMessages((prev: any) => [
            ...prev,
            {
                role: "user",
                content: "Add a new lesson."
            }, 
            {   
                id: newId,
                role: "assistant",
                content: "How would you like this new lesson to be structured? (e.g., topic, difficulty, goals, format)"
            }
        ]);

    }

    if (!module) {
        return;
    }

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
            
                {(saving) && <div className="delete-modal-overlay">
                    <div className="delete-modal saving">
                        <h3>Saving...</h3>
                        <div className="saving-bar-track">
                            <div className="saving-bar-streak" />
                        </div>
                        <p>Hang on tight! Your changes are being saved.</p>
                    </div>
                </div>
                }
            
            {(unDeployModal) && <div className="delete-modal-overlay">
            <div className="delete-modal">
                <h3>Undeploy this module?</h3>
                <p>This module will no longer be accessible to employees. Progress data will be preserved.</p>
                
                <div className="delete-input">
                    <label>Type 
                        <span className="bold-txt"> UNDEPLOY </span>
                        to confirm.
                    </label>
                    <input type="text" className="delete-text-input" placeholder="UNDEPLOY"
                    value={deleteModalInput} onChange={(e) => setDeleteModalInput(e.target.value)} />
                </div>

                <div className="delete-modal-actions">
                    <button className="cancel-btn" onClick={() => {setUnDeployModal(false); setDeleteModalInput("");}}>
                        Cancel
                    </button>
                    <button className="delete-btn" onClick={() => {handleRollBack(); setUnDeployModal(false);}} disabled={deleteModalInput !== "UNDEPLOY"}>
                        Undeploy 
                    </button>
                </div>
                </div>
            </div>}
            
            
            {/*(openDeployModal) && <div className="delete-modal-overlay">
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
            </div>*/}

            { (openDeployModal) && <div className="delete-modal-overlay">
                    <AssignModal 
                        workspace={workspace} 
                        moduleId={id}
                        setOpenModal={setDeployModal}
                        deploy={true} 
                        onDeploy={handleDeploy}
                    />
                </div>
            }

            { (assignModal) && <div className="delete-modal-overlay">
                    <AssignModal 
                        workspace={workspace} 
                        moduleId={id}
                        setOpenModal={setAssignModal}
                    />
                </div>
            }

            {(deleteModal) && <div className="delete-modal-overlay">
            <div className="delete-modal">
                <h3>Delete this module?</h3>
                <p>This module and all its lessons will be permanently deleted. Employee progress and simulation data will be preserved. This action cannot be undone.</p>
                
                <div className="delete-input">
                    <label>Type 
                        <span className="bold-txt"> DELETE </span>
                        to confirm.
                    </label>
                    <input type="text" className="delete-text-input" placeholder="DELETE"
                    value={deleteModalInput} onChange={(e) => setDeleteModalInput(e.target.value)} />
                </div>

                <div className="delete-modal-actions">
                    <button className="cancel-btn" onClick={() => {setDeleteModal(false); setDeleteModalInput("");}}>
                        Cancel
                    </button>
                    <button className="delete-btn danger" onClick={() => {handleDeleteModule(); setDeleteModal(false);}} disabled={deleteModalInput !== "DELETE"}>
                        Delete for everyone in my workspace
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
                                        Cadence is updating this module...
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
                                {   !isDeployed &&
                                    <>
                                    <Tooltip content={editMode ? "Apply edits" : "Edit title"}>
                                        <div className="builder-action" onClick={() => setEditMode(prev => !prev)}>
                                            <img src={editMode ? check_icon : edit_icon} />
                                        </div>
                                    </Tooltip>
                                    {applied && 
                                    <Tooltip content="Restore previous">
                                            <div className="builder-action" onClick={handleRestorePrevious}>
                                            <img src={undo_icon} />
                                        </div>
                                    </Tooltip>}
                                    <Tooltip content="Restore original">
                                        <div className="builder-action" onClick={handleRestoreOriginal}>
                                            <img src={refresh_icon} />
                                        </div>
                                    </Tooltip>
                                    </>}
                                <div className="builder-action-pill" onClick={() => setOpenModal(true)}>
                                    <span>
                                        <img src={folder_icon} />
                                    </span>
                                    View References {/* In the backend I'll make it so the attached files show "attached" */}
                                </div>
                                { !isDeployed &&
                                    <button className="builder-action-pill" onClick={handleSave} disabled={saving || isDeployed}>
                                        <span>
                                            <img src={file_icon} />
                                        </span>
                                        Save as Draft
                                    </button>
                                }
                                { isDeployed &&
                                    <button className="builder-action-pill"
                                        onClick={() => setAssignModal(true)}
                                    >
                                        <span>
                                            <img src={users_icon} />
                                        </span>
                                        Assign to Learners
                                    </button>
                                }
                                { !isDeployed ?
                                    <ActionButton text={"Deploy"} buttonType={"deploy"} onClick={() => setDeployModal(true)} disabled={isDeployed} />
                                    : <Tooltip content="This module has been deployed. If you wish to make edits, please undeploy this module. ">
                                        <div className={`module-card-btn ${(isDeployed) ? "deployed" : ""}`}>
                                            Deployed
                                        </div>
                                    </Tooltip>
                                }
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

                        <div className="module-header-builder-section">
                            <div className="module-info-line module-header-label-row">
                                <span className="module-info-label">MODULE CARD HEADER</span>
                                <p className="module-header-hint">
                                    Optional image for module cards (PNG, JPG, WebP, or GIF). Save to apply.
                                </p>
                            </div>
                            <div className="module-header-builder-inner">
                                <div
                                    className={`module-header-preview ${moduleHeaderPreviewSrc ? "has-image" : ""}`}
                                    style={
                                        moduleHeaderPreviewSrc
                                            ? { backgroundImage: `url(${moduleHeaderPreviewSrc})` }
                                            : undefined
                                    }
                                />
                                <div className="module-header-actions">
                                    <label className="module-header-upload-btn">
                                        <img src={upload_icon} alt="" />
                                        <span>{moduleHeaderPreviewSrc ? "Replace image" : "Upload image"}</span>
                                        <input
                                            type="file"
                                            accept={MODULE_HEADER_IMAGE_TYPES.join(",")}
                                            hidden
                                            onChange={onModuleHeaderFileChange}
                                        />
                                    </label>
                                    {(moduleHeaderPreviewSrc || headerImageStoragePath) && (
                                        <button type="button" className="module-header-remove-btn" onClick={clearModuleHeader}>
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
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
                            <button className="add-lesson-btn" onClick={handleAddLesson}>
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
                                    key={l.id}
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
                        <div className="builder-danger-zone">
                            <div className="danger-zone-top">
                                ⚠ Danger Zone
                            </div>
                            {isDeployed &&
                                <div className="danger-zone-item undeploy">
                                    <div className="danger-zone-content">
                                        <h4 className="bold-txt">Undeploy this module</h4>
                                        <p>This module will be taken offline. Learners will lose access until it is redeployed.</p>
                                    </div>
                                    <button className="danger-zone-btn" type="button" onClick={() => setUnDeployModal(true)}>
                                        Undeploy module
                                    </button>
                                </div>
                            }
                            <div className="danger-zone-item">
                                <div className="danger-zone-content">
                                    <h4 className="bold-txt">Delete Module</h4>
                                    <p>Remove this module from your workspace. Employee progress and simulation data will be preserved.</p>
                                </div>
                                <button className="danger-zone-btn delete" type="button" onClick={() => setDeleteModal(true)}>
                                    Delete module
                                </button>
                            </div>
                        </div>
                        {/*<div className="filler-space" />*/}
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
                            Cadence
                        </div>
                        <div className="x-icon" 
                            onClick={() => {
                                setOpenAIPanel(false)
                                if (isAddingLesson) {
                                    setChatMessages((prev) => prev.slice(0, -2));
                                    setIsAddingLesson(false);
                                }
                            }}
                            
                        >
                            <img src={x_icon} />
                        </div>
                    </div>
                    <div className="ai-panel-chat-space" ref={transcriptRef}>
                            {chatMessages.length === 0 && <div className="scroll-spacer" />}
                            {chatMessages.map((m, i, arr) => {
                            const isLast = i === arr.length - 1;
                            const shouldType = m.role === "assistant" && m.id === typingMessageId;
                            const lastAssistant = [...arr].reverse().find(msg => msg.role === "assistant");
                            const isLastAssistant = lastAssistant?.id === m.id;
                            const canRegenerate = isLastAssistant && typingMessageId === null && !aiLoading && !isAddingLesson;
                            const shouldApply = !isAddingLesson;
                            return (<ChatBubble key={m.id} message={m} shouldType={shouldType} stopTyping={stopTyping} onTypingComplete={() => {setTypingMessageId(null); setStopTyping(false);}}
                            className={isLast ? "last-message" : i === 0 ? "first-message" : ""} onTypingUpdate={scrollToBottom} lessons={lessons}  shouldApply={shouldApply} handleApply={() => handleApply(m.id)} 
                            shouldRegenerate={canRegenerate} handleRegenerate={() => handleRegenerate(m)}/>)})}
                            <div ref={bottomRef} />
                    </div>
                    <div className="builder-chat-wrapper">
                        {aiLoading && <div className="ai-loading-text">Cadence is applying changes...</div>}
                        <ChatBar context={"module"} 
                        addContext={!isAddingLesson}
                        userInput={userInput} setUserInput={setUserInput} handleSend={handleSend} 
                        pageContext={[
                            { id: id, label: "Module Base", isModule: true },
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

function AssignModal({ 
        workspace,
        moduleId,
        setOpenModal,
        deploy=false,
        onDeploy
     }:
     { 
        workspace: WorkspaceType,
        moduleId: string,
        setOpenModal: (val: boolean) => void,
        deploy?: boolean,
        onDeploy?: () => void;
    }) {
    const [employees, setEmployees] = useState<EmployeeUserType[]>([]);
    const [filtered, setFiltered] = useState<EmployeeUserType[]>([]);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<string[]>([]);

    useEffect(() => {
        if (!workspace) return;
    
        const fetchEmployees = async () => {
            const workspaceRef = doc(db, "workspaces", workspace.id);

            const q = query(
                collection(db, "users"),
                where("workspaceID", "==", workspaceRef),
                where("role", "==", "employee")
            );
    
            const snap = await getDocs(q);
    
            const users = snap.docs.map((doc) => ({
                employeeID: doc.id,
                ...doc.data(),
            })) as EmployeeUserType[];
    
            setEmployees(users);

            setSelected(users.map((u) => u.employeeID));
            setFiltered(users);

            const moduleRef = doc(db, "simulationModules", moduleId);
            const moduleSnap = await getDoc(moduleRef);

            if (!moduleSnap.exists()) return;

            const moduleData = moduleSnap.data();

            if (deploy) {
                setSelected(users.map((u) => u.employeeID));
            } else {
                const assignedRefs = moduleData.assignedUsers || [];
                const assignedIds = assignedRefs.map((ref: any) => ref.id);
                setSelected(assignedIds);
            }
        };
    
        fetchEmployees();
    }, [workspace]);

    useEffect(() => {
        if (!search.trim()) {
            setFiltered(employees);
            return;
        }
    
        const lower = search.toLowerCase();
    
        const results = employees.filter(
            (user) =>
                (user.fullName || "").toLowerCase().startsWith(lower) ||
                (user.email || "").toLowerCase().startsWith(lower)
        );
    
        setFiltered(results);
    }, [search, employees]);

    const toggleUser = (id: string) => {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((u) => u !== id)
                : [...prev, id]
        );
    };

    const handleDeploy = async () => {
        if (selected.length === 0) {
            return;
        }

        try {
            const assignedUserRefs = selected.map((userId) =>
                doc(db, "users", userId)
            );
    
            const moduleRef = doc(db, "simulationModules", moduleId);
    
            await updateDoc(moduleRef, {
                assignedUsers: assignedUserRefs,
            });
    
            onDeploy?.();
        } catch (err) {
            console.error("Error assigning module:", err);
        }

        setOpenModal(false);
    }

    return(
        <div className="attach-modal">
            <div className="x-icon-wrapper">
                Assign to Learners
            </div>
            <p>This module will become visible to all assigned employees for immediate access.</p>

            <div className="search-employee">
                <img src={search_icon} />
                <input 
                    placeholder="Search by name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="assignees">
                {filtered.map(e => (
                    <div
                        key={e.employeeID}
                        className="assignee-item"
                    >
                        <Checkbox color="cyan" 
                            checked={selected.includes(e.employeeID)}
                            onCheckedChange={() => toggleUser(e.employeeID)}
                        />
                        <div className="employee-icon">
                            <img src={e.profilePicture || default_icon} />
                        </div>

                        <div className="employee-info">
                            <p className="employee-info-name">{e.fullName}</p>
                            <p className="employee-info-email">{e.email}</p>
                        </div>
                    </div>
                ))

                }

            </div>
            <p>
                <span>{selected.length}</span>
                {" "}
                employees selected
            </p>
            
            <div className="delete-modal-actions">
                <button className="cancel-btn" onClick={() => setOpenModal(false)}>
                    Cancel
                </button>
                <button 
                    className="delete-btn"
                    onClick={handleDeploy}
                >
                    {deploy ? "Assign to Learners and Deploy" : "Assign to Learners"}
                </button>
            </div>

        </div>
    );
}