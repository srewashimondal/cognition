import './StandardBuilder.css';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc, deleteDoc } from 'firebase/firestore';
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
    const [deletedLessonIds, setDeletedLessonIds] = useState<string[]>([]);
    // const [deletedVideoPaths, setDeletedVideoPaths] = useState<string[]>([]);
    const [deletedVideos, setDeletedVideos] = useState<{path: string, lessonId: string}[]>([]);

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
                                        orderNumber: lessonData.orderNumber || 1
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

    const handleDeploy = async () => {
        try {
            const moduleRef = doc(db, "standardModules", moduleID!);
            await updateDoc(moduleRef, {
                deployed: true,
            });
        } catch (error) {
            console.error("Error deploying module:", error);
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
                            transcript: lesson.transcript || [],
                            summaries: lesson.summaries || [],
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
                            transcript: lesson.transcript || [],
                            summaries: lesson.summaries || [],
                        });
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
                            questions: lesson.questions || [],
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

            return [...prev, newLesson];
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
    

    const handleNavigateQuiz = (moduleID: string, quizID: string) => {
        navigate(`/employer/modules/standard-builder/${moduleID}/${quizID}`)
    };

    function formatTimestamp(timestamp: string) {
        if (!timestamp) return 'Unknown';
        
        const secondsMatch = timestamp.match(/seconds=(\d+)/);  
        if (!secondsMatch) return 'Invalid date';
        
        const seconds = parseInt(secondsMatch[1]);
        const date = new Date(seconds * 1000);
        
        return date.toLocaleString('en-US', {
            month: 'long',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).replace(' at ', ' ').replace(/\s(?=[AP]M$)/, '');
    }

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
            <div className="standard-canvas-wrapper">
                <div className="standard-canvas-top">
                    <Tooltip content="Back">
                        <div className="back-to-modules builder" onClick={() => navigate(-1)}>
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
                                {saving ? "Saving..." : "Save as Draft"}
                            </div>
                            <ActionButton text={"Deploy"} buttonType={"deploy"} onClick={handleDeploy}  />
                        </div>
                    </div>

                    <div className="module-info-builder">
                        <div className="module-info-line">
                            <span className="module-info-label">CREATED</span>
                            <p className="module-info-value">{formatTimestamp(String(createdTime))}</p>
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