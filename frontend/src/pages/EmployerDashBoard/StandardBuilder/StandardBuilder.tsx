import './StandardBuilder.css';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, deleteObject } from 'firebase/storage';
import { db, storage } from '../../../firebase';
import type { DocumentReference } from 'firebase/firestore';
import ActionButton from '../../../components/ActionButton/ActionButton';
import EmployerCard from '../../../cards/StandardLesson/EmployerCard/EmployerCard';
import type { StandardModuleType } from '../../../types/Standard/StandardModule';
import type { StandardLessonType, VideoLessonType, QuizLessonType } from '../../../types/Standard/StandardLessons';
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import { Tooltip } from "@radix-ui/themes";
import { formatTimestampString } from '../../../utils/Utils';
// import { standardModule } from '../../../dummy_data/standard_data';
import orange_left_arrow from '../../../assets/icons/orange-left-arrow.svg';
import edit_icon from '../../../assets/icons/simulations/grey-edit-icon.svg';
import check_icon from '../../../assets/icons/simulations/grey-check-icon.svg';
import file_icon from '../../../assets/icons/simulations/grey-file-icon.svg';
import cap_icon from '../../../assets/icons/simulations/black-cap-icon.svg';
import white_plus_icon from '../../../assets/icons/simulations/white-plus-icon.svg';
import blue_plus_icon from '../../../assets/icons/simulations/blue-plus-icon.svg';

export default function StandardBuilder() {
    const navigate = useNavigate();
    const { moduleID } = useParams();
    const [loading, setLoading] = useState(true);
    const [module, setModule] = useState<StandardModuleType | null>(null);
    const isNewDraft = !moduleID;
    // const id = !isNewDraft ? Number(moduleID) : null;
    // const module = !isNewDraft ? standardModule.find(m => m.id === id) : null;
    // const lessonsList = !isNewDraft ? module?.lessons : null;

    const [editMode, setEditMode] = useState(false);
    const [title, setTitle] = useState("New Module Title");
    const [lessons, setLessons] = useState<StandardLessonType[]>([]);
    const [lessonToDelete, setLessonToDelete] = useState<StandardLessonType | null>(null);
    const [createdTime, setCreatedTime] = useState("");
    const [lastModified, setLastModified] = useState(new Date().toISOString());
    const [deletedLessonIds, setDeletedLessonIds] = useState<string[]>([]);
    // const [deletedVideoPaths, setDeletedVideoPaths] = useState<string[]>([]);
    const [deletedVideos, setDeletedVideos] = useState<{path: string, lessonId: string}[]>([]);
    const [openDeployModal, setDeployModal] = useState(false);
    const [unDeployModal, setUnDeployModal] = useState(false);
    const [anotherDeployModal, setAnotherDeployModal] = useState(false);
    const [isDeployed, setIsDeployed] = useState(module?.deployed);

    useEffect(() => {
        async function fetchModule() {
            if (!moduleID) {
                setLoading(false);
                return;
            }

            try {
                const moduleRef = doc(db, "standardModules", moduleID);
                const moduleSnap = await getDoc(moduleRef);

                if (moduleSnap.exists()) {
                    const moduleData = moduleSnap.data() as Omit<StandardModuleType, 'id'>;

                    let lessonsData: StandardLessonType[] = [];
                    if (moduleData.lessonRefs && moduleData.lessonRefs.length > 0) {
                        const lessonPromises = moduleData.lessonRefs.map(async (ref) => {
                            const lessonSnap = await getDoc(ref);
                            if (lessonSnap.exists()) {
                                const lessonData = lessonSnap.data();

                                if (lessonData.type === "video") {
                                    return {
                                        id: ref.id,
                                        title: lessonData.title,
                                        type: "video",
                                        orderNumber: lessonData.orderNumber || 1,
                                        videoFilePath: lessonData.videoFilePath,
                                        allowTranscript: lessonData.allowTranscript ?? true,
                                        allowSummary: lessonData.allowSummary ?? true,
                                        dueDate: lessonData.dueDate,
                                        duration: lessonData.duration,
                                    } as VideoLessonType;
                                } else if (lessonData.type === "quiz") {
                                    return {
                                        id: ref.id,
                                        title: lessonData.title,
                                        type: "quiz",
                                        orderNumber: lessonData.orderNumber || 1,
                                        dueDate: lessonData.dueDate,
                                        duration: lessonData.duration,
                                        questions: lessonData.questions || [],
                                        timeLimitMode: lessonData.timeLimitMode,
                                        passingScore: lessonData.passingScore,
                                        retakeMode: lessonData.retakeMode,
                                        numberOfRetakes: lessonData.numberOfRetakes
                                    } as QuizLessonType;
                                }
                            }
                        });

                        const fetchedLessons = await Promise.all(lessonPromises);
                        lessonsData = fetchedLessons.filter(l => l !== null) as StandardLessonType[];
                    } 

                    setModule({
                        id: moduleID,
                        ...moduleData,
                        lessons: lessonsData
                    });

                    setTitle(moduleData.title);
                    setLessons(lessonsData);
                    setCreatedTime(moduleData.createTime || "Unknown");
                    setLastModified(moduleData.lastModified || "Unknown");
                } else {
                    console.error("Module not found");
                }
            } catch (error) {
                console.error("Error fetching module:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchModule();
    }, [moduleID])

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

    const validateLessonsForDeploy = (): boolean => {
        for (const lesson of lessons) {
            if (!lesson.title || lesson.title.trim() === "" || lesson.title === "New Lesson Title" || lesson.title === "New Quiz Title") {
                return false;
            }
            if (!lesson.dueDate) {
                return false;
            }
            if (lesson.type === "video") {
                if (!lesson.videoFilePath && !lesson.pendingVideoFile) {
                    return false;
                }
            }
                if (lesson.type === "quiz") {
                if (!lesson.questions || lesson.questions.length === 0) {
                    return false;
                }
            }
        }
    
        return true;
    };
    
    
    const handleDeploy = async () => {
        const isValid = validateLessonsForDeploy();
        if (!isValid) {
            setDeployModal(true);
            return;
        }

        try {
            const moduleRef = doc(db, "standardModules", moduleID!);
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
            const moduleRef = doc(db, "standardModules", moduleID!);
            await updateDoc(moduleRef, {
                deployed: false,
            });
            setIsDeployed(false);
        } catch (error) {
            console.error("Error rolling back module:", error);
        }
    };

    const calculateTotalHours = (lessons: StandardLessonType[]): string => {
        const totalMinutes = lessons.reduce((acc, lesson) => {
            return acc + (lesson.duration || 0);
        }, 0);
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    };

    const calculateQuizDuration = (numQuestions: number, timePerQuestion: number = 2): number => {
        return numQuestions * timePerQuestion;
    };

    const getQuizDuration = (lesson: QuizLessonType): number => {
        if (lesson.timeLimitMode === "custom" && lesson.timeLimitHour && lesson.timeLimitMinute) {
            return (lesson.timeLimitHour * 60) + lesson.timeLimitMinute;
        }

        return calculateQuizDuration(lesson.questions?.length || 0);
    };

    const getVideoDuration = (videoFile: File): Promise<number> => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            
            video.onloadedmetadata = () => {
                URL.revokeObjectURL(video.src);
                resolve(Math.round(video.duration)); 
            };
            
            video.onerror = () => {
                reject(new Error('Failed to load video metadata'));
            };
            
            video.src = URL.createObjectURL(videoFile);
        });
    };

    const calculateLessonDuration = async (lesson: StandardLessonType): Promise<number> => {
        if (lesson.type === "video") {
            if (lesson.pendingVideoFile) {
                const durationSec = await getVideoDuration(lesson.pendingVideoFile);
                return Math.ceil(durationSec / 60);
            } else if (lesson.videoFilePath) {
                return lesson.duration || 5;
            }
            return 0;
        } else {
            return getQuizDuration(lesson);
        }
    };

    const [saving, setSaving] = useState(false);
    const [isGeneratingSummaries, setIsGeneratingSummaries] = useState(false);
    const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);
    const handleSave = async () => {
        try {
            setSaving(true);
            console.log("deletedVideos at save:", deletedVideos);

            if (deletedLessonIds.length > 0) {
                const deletePromises = deletedLessonIds.map(id => 
                    deleteDoc(doc(db, "standardLessons", id))
                );
                await Promise.all(deletePromises);
                console.log(`Deleted ${deletedLessonIds.length} lessons from Firestore`);
            }
            
            if (deletedVideos.length > 0) {
                const deleteVideoPromises = deletedVideos.map(({path, lessonId}) => 
                    deleteVideoFromStorage(path, lessonId)
                );
                await Promise.all(deleteVideoPromises);
            }

            const lessonRefs: DocumentReference[] = [];

            for (const lesson of lessons) {
                let videoFilePath = lesson.type === "video" ? lesson.videoFilePath : undefined;
                
                if (lesson.type === "video" && lesson.pendingVideoFile) {
                    console.log(`Uploading video for lesson: ${lesson.title}`);
                    const timestamp = Date.now();
                    const filename = `${timestamp}-${lesson.pendingVideoFile.name}`;
                    const storagePath = `trainingVideos/${filename}`;
                    const videoRef = ref(storage, storagePath);
                    await uploadBytes(videoRef, lesson.pendingVideoFile);
                    videoFilePath = storagePath;
                    // 
                    setLessons(prev =>
                        prev.map(l =>
                            l.id === lesson.id
                                ? {
                                    ...l,
                                    videoFilePath: storagePath,  
                                    pendingVideoFile: undefined
                                  }
                                : l
                        )
                    );
                    console.log(`Video uploaded: ${storagePath}`);
                }

                const isNewLesson = lesson.isTemp === true;
                const baseLessonData = {
                    title: lesson.title,
                    type: lesson.type,
                    orderNumber: lesson.orderNumber,
                    duration: await calculateLessonDuration(lesson),
                    dueDate: lesson.dueDate || null,
                };

                if (isNewLesson) {
                    const lessonsCollection = collection(db, "standardLessons");
                    const lessonData = lesson.type === "video" 
                        ? {
                            ...baseLessonData,
                            videoFilePath: videoFilePath,
                            allowTranscript: lesson.allowTranscript ?? true,
                            allowSummary: lesson.allowSummary ?? true,
                            requireCompletion: lesson.requireCompletion ?? false,
                            allowPlaybackSpeed: lesson.allowPlaybackSpeed ?? true,
                            thumbnailUrl: lesson.thumbnailUrl || null,
                            filename: lesson.filename || null,
                            durationSeconds: lesson.durationSeconds || null,
                        }
                        : {
                            ...baseLessonData,
                            timeLimitMode: lesson.timeLimitMode || "unlimited",
                            timeLimitHour: lesson.timeLimitHour || null,
                            timeLimitMinute: lesson.timeLimitMinute || null,
                            passingScore: lesson.passingScore || 70,
                            retakeMode: lesson.retakeMode || "unlimited",
                            numberOfRetakes: lesson.numberOfRetakes || null,
                            questions: lesson.questions || [],
                        };
                    
                    const newLessonRef = await addDoc(lessonsCollection, lessonData);
                    // this is for generating summaries
                    if (lesson.type === "video" && videoFilePath && (!lesson.summaries || lesson.summaries.length === 0) && lesson.allowSummary) {
                        setIsGeneratingSummaries(true);
                        try {
                            await fetch("http://localhost:8000/ai/generate-video-summary", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    lesson_id: newLessonRef.id,
                                    video_path: videoFilePath,
                                }),
                            });

                            console.log("AI summaries generated for new lesson");
                        } catch (error) {
                            console.error("AI generation failed:", error);
                        } finally {
                            setIsGeneratingSummaries(false);
                        }
                    }
                    // this is for generating a transcript
                    if (lesson.type === "video" && videoFilePath && (!lesson.transcript || lesson.transcript.length === 0) && lesson.allowTranscript) {
                        setIsGeneratingTranscript(true);
                        try {
                            await fetch("http://localhost:8000/ai/generate-video-transcript", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    lesson_id: lesson.id,
                                    video_path: videoFilePath,
                                }),
                            });
                    
                            console.log("Transcript generated");
                        } catch (error) {
                            console.error("Transcript generation failed:", error);
                        } finally {
                            setIsGeneratingTranscript(false);
                        }
                    }

                    setLessons(prev =>
                        prev.map(l =>
                            l.id === lesson.id
                                ? { ...l, id: newLessonRef.id, isTemp: false }
                                : l
                        )
                    );
                    lessonRefs.push(newLessonRef);
                    
                } else {
                    const lessonRef = doc(db, "standardLessons", lesson.id);
                    if (lesson.type === "video") {
                        await updateDoc(lessonRef, {
                            title: lesson.title,
                            orderNumber: lesson.orderNumber,
                            duration: await calculateLessonDuration(lesson),
                            dueDate: lesson.dueDate || null,
                            videoFilePath: videoFilePath,
                            allowTranscript: lesson.allowTranscript ?? true,
                            allowSummary: lesson.allowSummary ?? true,
                            requireCompletion: lesson.requireCompletion ?? false,
                            allowPlaybackSpeed: lesson.allowPlaybackSpeed ?? true,
                            thumbnailUrl: lesson.thumbnailUrl || null,
                            filename: lesson.filename || null,
                            durationSeconds: lesson.durationSeconds || null,
                        });
                        
                        // generating summary if lesson alr exits
                        if (videoFilePath && lesson.pendingVideoFile && (!lesson.summaries || lesson.summaries.length === 0) && lesson.allowSummary) {
                            setIsGeneratingSummaries(true);
                            try {
                                await fetch("http://localhost:8000/ai/generate-video-summary", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        lesson_id: lesson.id,
                                        video_path: videoFilePath,
                                    }),
                                });
                        
                                console.log("AI summaries regenerated for existing lesson");
                            } catch (error) {
                                console.error("AI generation failed:", error);
                            } finally {
                                setIsGeneratingSummaries(false);
                            }
                        }

                        // generating transcript if lesson alr exists
                        if (lesson.type === "video" && lesson.pendingVideoFile && (!lesson.transcript || lesson.transcript.length === 0) && lesson.allowTranscript) {
                            setIsGeneratingTranscript(true);
                            try {
                                await fetch("http://localhost:8000/ai/generate-video-transcript", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        lesson_id: lesson.id,
                                        video_path: videoFilePath,
                                    }),
                                });
                        
                                console.log("Transcript generated");
                            } catch (error) {
                                console.error("Transcript generation failed:", error);
                            } finally {
                                setIsGeneratingTranscript(false);
                            }
                        }
                        
                    } else {
                        await updateDoc(lessonRef, {
                            title: lesson.title,
                            orderNumber: lesson.orderNumber,
                            duration: await calculateLessonDuration(lesson),
                            dueDate: lesson.dueDate || null,
                            timeLimitMode: lesson.timeLimitMode || "unlimited",
                            timeLimitHour: lesson.timeLimitHour || null,
                            timeLimitMinute: lesson.timeLimitMinute || null,
                            passingScore: lesson.passingScore || 70,
                            retakeMode: lesson.retakeMode || "unlimited",
                            numberOfRetakes: lesson.numberOfRetakes || null,
                        });
                    }
                    
                    lessonRefs.push(lessonRef);
                }
            }

            const moduleData = {
                title,
                kind: "standard",
                deployed: false,
                createTime: createdTime || new Date().toISOString(),
                hours: calculateTotalHours(lessons),
                lessonRefs: lessonRefs,
                numLessons: lessons.length,
                lastModified: new Date().toISOString()
            };

            if (isNewDraft) {
                const modulesRef = collection(db, "standardModules");
                const newModuleRef = await addDoc(modulesRef, moduleData);
                navigate(`/employer/modules/standard-builder/${newModuleRef.id}`);
            } else {
                const moduleRef = doc(db, "standardModules", moduleID!);
                await updateDoc(moduleRef, moduleData);
            }
            setDeletedVideos([]);
            setDeletedLessonIds([]);
            setLastModified(moduleData.lastModified);
            console.log("Module saved successfully!");   
        } catch (error) {
            console.error("Error saving module:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleAddVideo = () => {
        setLessons(prev => {
            const newOrder = lessons.length + 1; 
            const newLesson: StandardLessonType = {
                id: String(Date.now()),
                isTemp: true,
                title: "New Lesson Title",
                type: "video",
                orderNumber: newOrder
            };

            return [...prev, newLesson];
        });
    };

    const handleAddQuiz = () => {
        setLessons(prev => {
            const newOrder = lessons.length + 1; 
            const newLesson: StandardLessonType = {
                id: String(Date.now()),
                isTemp: true,
                title: "New Quiz Title",
                type: "quiz",
                orderNumber: newOrder
            };

            const updatedLessons = [...prev, newLesson];
            return updatedLessons;
        });
    };

    const handleDelete = (lessonToDelete: StandardLessonType) => {
        setDeletedLessonIds(prev => [...prev, lessonToDelete.id]);

        if (lessonToDelete.type === "video") {
            const videoPath = lessonToDelete.videoFilePath;
            if (videoPath) {
                setDeletedVideos(prev => [...prev, {
                    path: videoPath, 
                    lessonId: lessonToDelete.id
                }]);
            }
        }

        setLessons((prev) => {
            const filtered = prev.filter((l) => l.id !== lessonToDelete.id);
            return filtered.map((lesson, index) => ({
                ...lesson,
                orderNumber: index + 1
            }));
        });
        setLessonToDelete(null);
    };

    const deleteVideoFromStorage = async (videoPath: string, lessonId: string) => {
        try {
            const videoRef = ref(storage, videoPath);
            await deleteObject(videoRef);
            console.log(`Deleted video: ${videoPath}`);

            const lessonRef = doc(db, "standardLessons", lessonId);
            await updateDoc(lessonRef, {
                videoFilePath: null
            });
  
            setLessons(prev => prev.map(lesson => 
                lesson.id === lessonId && lesson.type === "video"
                    ? { ...lesson, videoFilePath: undefined }
                    : lesson
            ));
            
            console.log(`Cleared videoFilePath for lesson: ${lessonId}`);
            
        } catch (error) {
            console.error(`Error deleting video: ${videoPath}`, error);
        }
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
      
        if (!over || active.id === over.id) return;
      
        setLessons((prev) => {
            const oldIndex = prev.findIndex(l => l.id === active.id);
            const newIndex = prev.findIndex(l => l.id === over.id);
            
            const reordered = arrayMove(prev, oldIndex, newIndex);
            
            const updatedLessons = reordered.map((lesson, index) => ({
                ...lesson,
                orderNumber: index + 1
            }));
            
            updateLessonOrders(updatedLessons);
            return updatedLessons;
        });
    };

    const updateLessonOrders = async (lessons: StandardLessonType[]) => {
        try {
            const updatePromises = lessons.map(lesson => {
                const lessonRef = doc(db, "standardLessons", lesson.id);
                return updateDoc(lessonRef, {
                    orderNumber: lesson.orderNumber
                });
            });
            
            await Promise.all(updatePromises);
            console.log("Lesson orders updated in Firebase");
        } catch (error) {
            console.error("Error updating lesson orders:", error);
        }
    };
    

    const handleNavigateQuiz = async (moduleID: string, quizID: string) => {
        const lesson = lessons.find(l => l.id === quizID);
    
        if (!lesson || lesson.type !== "quiz") return;

        if (!lesson.isTemp) {
            const lessonRef = doc(db, "standardLessons", quizID);
        
            await updateDoc(lessonRef, {
                title: lesson.title,
                orderNumber: lesson.orderNumber,
                dueDate: lesson.dueDate || null,
                timeLimitMode: lesson.timeLimitMode || "unlimited",
                passingScore: lesson.passingScore || 70,
                duration: lesson.duration || 0,
                lastModified: new Date().toISOString()
            });
        
            navigate(`/employer/modules/standard-builder/${moduleID}/${quizID}`);
            return;
        }
        
    
        try {
            const lessonsCollection = collection(db, "standardLessons");
    
            const newLessonRef = await addDoc(lessonsCollection, {
                title: lesson.title,
                type: "quiz",
                orderNumber: lesson.orderNumber,
                dueDate: lesson.dueDate || null,
                timeLimitMode: lesson.timeLimitMode || "unlimited",
                passingScore: lesson.passingScore || 70,
                duration: 0
            });
    
            const moduleRef = doc(db, "standardModules", moduleID);
    
            await updateDoc(moduleRef, {
                lessonRefs: arrayUnion(doc(db, "standardLessons", newLessonRef.id)),
                lastModified: new Date().toISOString()
            });
    
            setLessons(prev =>
                prev.map(l =>
                    l.id === quizID
                        ? { ...l, id: newLessonRef.id, isTemp: false }
                        : l
                )
            );
            
            console.log("moduleID:", moduleID);
            navigate(`/employer/modules/standard-builder/${moduleID}/${newLessonRef.id}`);
    
        } catch (error) {
            console.error("Error creating quiz before navigation:", error);
        }
    };

    const updateLessonTitle = (lessonId: string, newTitle: string) => {
        setLessons(prev => prev.map(lesson => 
            lesson.id === lessonId 
                ? { ...lesson, title: newTitle }
                : lesson
        ));
    };

    const updateLessonVideoFile = (lessonId: string, file: File) => {
        setLessons(prev => prev.map(lesson => 
            lesson.id === lessonId && lesson.type === "video"
                ? { ...lesson, pendingVideoFile: file } as VideoLessonType
                : lesson
        ));
    };

    const updateVideoSettings = (lessonId: string, settings: Partial<VideoLessonType>) => {
        setLessons(prev => prev.map(lesson => 
            lesson.id === lessonId && lesson.type === "video"
                ? { ...lesson, ...settings }
                : lesson
        ));
    };

    const updateQuizSettings = (lessonId: string, settings: Partial<QuizLessonType>) => {
        setLessons(prev => prev.map(lesson => 
            lesson.id === lessonId && lesson.type === "quiz"
                ? { ...lesson, ...settings }
                : lesson
        ));
    };

    const updateDueDate = (lessonId: string, date: string | null) => {
        setLessons(prev => prev.map(lesson => 
            lesson.id === lessonId 
                ? { ...lesson, dueDate: date }
                : lesson
        ));
    };

    const handleDeleteVideo = (lessonId: string) => {
        const lesson = lessons.find(l => l.id === lessonId);
    
        if (!lesson || lesson.type !== "video") return;
    
        if (lesson.videoFilePath) {
            setDeletedVideos(prev => [
                ...prev,
                { path: lesson.videoFilePath as string, lessonId }
            ]);
        }
    
        setLessons(prev =>
            prev.map(l =>
                l.id === lessonId
                    ? {
                        ...l,
                        videoFilePath: undefined,
                        pendingVideoFile: undefined
                    }
                    : l
            )
        );
    };
    

    return (
        <div className="standard-builder-canvas-page">
            {(lessonToDelete) && <div className="delete-modal-overlay">
            <div className="delete-modal">
                <h3>Are you sure you want to delete this lesson? This action cannot be undone.</h3>
                    <div className="delete-modal-actions">
                        <button className="cancel-btn" onClick={() => setLessonToDelete(null)}>
                            Cancel
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(lessonToDelete)}>Delete</button>
                    </div>
                </div>
            </div>
            }

            {(openDeployModal) && <div className="delete-modal-overlay">
            <div className="delete-modal">
                <h3>Module Not Ready for Deployment</h3>
                <p>Some lessons are incomplete. Please ensure every lesson has a title, due date, and required content before deploying.</p>
                    <div className="delete-modal-actions">
                        <button className="delete-btn" onClick={() => setDeployModal(false)}>
                            OK
                        </button>
                    </div>
                </div>
            </div>
            }

            {(anotherDeployModal) && <div className="delete-modal-overlay">
            <div className="delete-modal">
                <h3>Deploy this module?</h3>
                <p>This module will become visible to employees. Any enrolled users will be able to access it immediately.</p>
                    <div className="delete-modal-actions">
                        <button className="cancel-btn" onClick={() => setAnotherDeployModal(false)}>
                            Cancel
                        </button>
                        <button className="delete-btn" onClick={() => {handleDeploy(); setAnotherDeployModal(false);}}>
                            Deploy
                        </button>
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
            
            <div className="standard-canvas-wrapper">
                <div className="standard-canvas-top">
                    <Tooltip content="Back">
                        <div className="back-to-modules builder" onClick={async () => {await handleSave(); navigate(-1);}}>
                            <img src={orange_left_arrow} />
                        </div>
                    </Tooltip>
                    <div className="modules-header lesson-pg">
                        <div className="builder-header-wrapper">
                            <div className="builder-page-title">
                                Builder Studio / Standard Modules
                            </div>
                            {editMode ? 
                                <div className="title-input-wrapper">
                                    <span className="edit-mode-icon">
                                        <img src={edit_icon} />
                                    </span>
                                    <div className="title-input">
                                        <input type="text" placeholder="Enter new title" value={title} onChange={(e) => setTitle(e.target.value)} />
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
                            <div className="builder-action-pill" onClick={handleSave}>
                                <span>
                                    <img src={file_icon} />
                                </span>
                                {saving ? 
                                    isGeneratingSummaries ? "Generating summaries..." 
                                    : isGeneratingTranscript ? "Generating transcripts..." : "Saving..."
                                    : "Save as Draft"}
                            </div>
                            <ActionButton text={"Deploy"} buttonType={"deploy"} onClick={() => {if (!isDeployed) {setAnotherDeployModal(true);} else {setUnDeployModal(true);}}} disabled={isDeployed} />
                        </div>
                    </div>

                    <div className="module-info-builder">
                        <div className="module-info-line">
                            <span className="module-info-label">LAST MODIFIED</span>
                            <p className="module-info-value">{formatTimestampString(lastModified)}</p>
                        </div>

                        <div className="module-info-line">
                            <span className="module-info-label">TOTAL LESSONS</span>
                            <p className="module-info-value">{lessons?.length} lesson{lessons?.length !== 1 && "s"}</p> 
                        </div>
                        <div className="builder-filler-space" />
                    </div>
                </div>
                <div className="standard-canvas-bottom">
                    <div className="lesson-title-wrapper standard">
                        <div className="module-info-line lesson">
                            <span className="module-info-icon">
                                <img src={cap_icon} />
                            </span>
                            <span className="module-info-label lesson">LESSONS</span>
                        </div>
                        {(lessons?.length > 0) && 
                        <div className="add-lesson-panel">
                            <button className="add-lesson-btn" onClick={handleAddVideo}>
                                <div className="add-icon-swap">
                                    <img className="add-icon default" src={white_plus_icon} />
                                    <img className="add-icon hover" src={blue_plus_icon} />
                                </div>
                                Add Video Lesson
                            </button>
                            <button className="add-lesson-btn" onClick={handleAddQuiz}>
                                <div className="add-icon-swap">
                                    <img className="add-icon default" src={white_plus_icon} />
                                    <img className="add-icon hover" src={blue_plus_icon} />
                                </div>
                                Add Quiz
                            </button>
                        </div>}
                    </div>
                        <div className="lessons-list">
                        {
                            (lessons.length === 0) ?
                            <div className="empty-lessons-list">
                                <p>There are currently no lessons</p>
                                <button className="add-lesson-btn" onClick={handleAddVideo}>
                                    <div className="add-icon-swap">
                                        <img className="add-icon default" src={white_plus_icon} />
                                        <img className="add-icon hover" src={blue_plus_icon} />
                                    </div>
                                    Add Video Lesson
                                </button>
                            </div> 
                            : <>
                                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
                                        {lessons.sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0)).map((l) => 
                                        <EmployerCard 
                                            key={l.id} 
                                            lesson={l} 
                                            isNewDraft={l.title === "New Quiz Title"}
                                            handleDelete={() => setLessonToDelete(l)} 
                                            navigateQuiz={() => handleNavigateQuiz(moduleID!, l.id)}
                                            onTitleChange={(newTitle) => updateLessonTitle(l.id, newTitle)}
                                            onVideoFileChange={(file) => updateLessonVideoFile(l.id, file)}
                                            onVideoSettingsChange={(settings) => updateVideoSettings(l.id, settings)}
                                            onQuizSettingsChange={(settings) => updateQuizSettings(l.id, settings)}
                                            onDueDateChange={(date) => updateDueDate(l.id, date)}
                                            onDeleteVideo={() => handleDeleteVideo(l.id)}
                                        />)}
                                    </SortableContext>
                                </DndContext>
                            </>
                        }
                        </div>
                    <div className="filler-space" /> 
                </div>
            </div>
        </div>
    );
}