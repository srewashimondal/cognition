import './QuizBuilder.css';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ActionButton from '../../../../components/ActionButton/ActionButton';
import QuestionCard from '../../../../cards/QuestionCard/QuestionCard';
import type { QuizLessonType } from '../../../../types/Standard/StandardLessons';
import type { QuizQuestionType } from '../../../../types/Standard/QuizQuestion/QuestionTypes';
import { doc, getDoc, updateDoc, collection, addDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { db, storage } from '../../../../firebase';
import { ref, uploadBytes, deleteObject } from 'firebase/storage';
import { formatTimestampString } from '../../../../utils/Utils';
// import { standardModule } from '../../../../dummy_data/standard_data';
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import { Tooltip } from "@radix-ui/themes";
import orange_left_arrow from '../../../../assets/icons/orange-left-arrow.svg';
import edit_icon from '../../../../assets/icons/simulations/grey-edit-icon.svg';
import check_icon from '../../../../assets/icons/simulations/grey-check-icon.svg';
import list_icon from '../../../../assets/icons/black-list-icon.svg';
import white_plus_icon from '../../../../assets/icons/simulations/white-plus-icon.svg';
import blue_plus_icon from '../../../../assets/icons/simulations/blue-plus-icon.svg';
import ai_icon from '../../../../assets/icons/simulations/white-ai-icon.svg';

export default function QuizBuilder () {
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

    const navigate = useNavigate();
    const { moduleID, quizID } = useParams();
    const [quiz, setQuiz] = useState<QuizLessonType | null>(null);
    const [loading, setLoading] = useState(true);
    const [openSaveModal, setOpenSaveModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lastModified, setLastModified] = useState(new Date().toISOString());

    useEffect(() => {
    if (!quizID) return;

    const fetchQuiz = async () => {
        try {
        const quizRef = doc(db, "standardLessons", quizID);
        const snap = await getDoc(quizRef);

        if (snap.exists()) {
            const data = snap.data();
            if (data.type === "quiz") {
            setQuiz({
                id: quizID,
                ...data
            } as QuizLessonType);
            }
        }
        } catch (err) {
        console.error("Error fetching quiz:", err);
        } finally {
        setLoading(false);
        }
    };

    fetchQuiz();
    }, [quizID]);


    const [editMode, setEditMode] = useState(false);
    const [title, setTitle] = useState(quiz?.title ?? "New Quiz Title");
    const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
    const [questionToDelete, setQuestionToDelete] = useState<QuizQuestionType | null>(null);
    const [deletedImages, setDeletedImages] = useState<string[]>([]);


    useEffect(() => {
        if (!quiz) return;
      
        setTitle(quiz.title || "New Quiz Title");
        setQuestions(quiz.questions || []);
      }, [quiz]);

    const handleAddQuestion = () => {
        setQuestions(prev => {
            const lastId = prev.length > 0 ? prev[prev.length - 1].id : 0;

            const newQuestion: QuizQuestionType = {
                id: lastId + 1,
                prompt: "",
                type: "mcq",
                options: ["Choice 1", "Choice 2"],
                correctAnswerIndex: 0
            };

            return [...prev, newQuestion];
        });
    };

    const handleDelete = (questionToDelete: QuizQuestionType) => {
        setQuestions((prev) => prev.filter((q) => q.id !== questionToDelete.id));
        setQuestionToDelete(null);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
      
        if (!over || active.id === over.id) return;
      
        setQuestions((prev) => {
          const oldIndex = prev.findIndex(l => l.id === active.id);
          const newIndex = prev.findIndex(l => l.id === over.id);
          return arrayMove(prev, oldIndex, newIndex);
        });
    };

    const updateQuestion = (id: number, updates: Partial<QuizQuestionType>) => {
        setQuestions(prev =>
          prev.map(q => {
            if (q.id !== id) return q;
                if ("image" in updates && updates.image === null && typeof q.image === "string") {
                    setDeletedImages(prev => [...prev, q.image as string]);
                }
            return { ...q, ...updates };
          })
        );
    };
      

    const handleSaveQuiz = async () => {
        if (!quizID) return;

        setSaving(true);

        const processedQuestions = await Promise.all(
            questions.map(async (q) => {
                let imagePath = q.image;
            
                if (q.image instanceof File) {
                    const timestamp = Date.now();
                    const storagePath = `quizImages/${timestamp}-${q.image.name}`;
                    const imageRef = ref(storage, storagePath);
                
                    await uploadBytes(imageRef, q.image);
                
                    imagePath = storagePath;
                }
            
                return {
                    ...q,
                    image: imagePath ?? null
                };
            })
        );

        for (const question of questions) {

            if (!question.prompt || question.prompt.trim() === "") {
                setOpenSaveModal(true);
                return;
            }
    
            if (question.type === "mcq") {
                if (!question.options || question.options.length === 0) {
                    setOpenSaveModal(true);
                    return;
                }

                const hasEmptyOption = question.options.some(
                    opt => !opt || opt.trim() === "" || /^choice\s*\d+$/i.test(opt.trim())
                );
    
                if (hasEmptyOption) {
                    setOpenSaveModal(true);
                    return;
                }
            }
        }
          
        try {
            const quizRef = doc(db, "standardLessons", quizID);

            for (const path of deletedImages) {
                try {
                    const imageRef = ref(storage, path);
                    await deleteObject(imageRef);
                    console.log("Deleted image from storage:", path);
                } catch (err) {
                    console.error("Error deleting image:", err);
                }
            }
          
            setDeletedImages([]);
            
            const newTimestamp = new Date().toISOString();
            await updateDoc(quizRef, {
                title,
                questions: processedQuestions,
                duration: processedQuestions.length * 2,
                lastModified: newTimestamp
            });          
            setLastModified(newTimestamp);
            console.log("Quiz saved successfully");
        } catch (error) {
            console.error("Error saving quiz:", error);
        } finally {
            setSaving(false);
        }
    };
    

    return (
        <div className="quiz-builder-page">
            {(questionToDelete) && <div className="delete-modal-overlay">
            <div className="delete-modal">
                <h3>Are you sure you want to delete this question? This action cannot be undone.</h3>
                    <div className="delete-modal-actions">
                        <button className="cancel-btn" onClick={() => setQuestionToDelete(null)}>
                            Cancel
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(questionToDelete)}>Delete</button>
                    </div>
                </div>
            </div>
            }
            {(openSaveModal) && <div className="delete-modal-overlay">
            <div className="delete-modal">
                <h3>Quiz Not Ready for Save</h3>
                <p>Make sure no questions have empty prompts or choices.</p>
                    <div className="delete-modal-actions">
                        <button className="delete-btn" onClick={() => setOpenSaveModal(false)}>OK</button>
                    </div>
                </div>
            </div>
            }
            <div className="standard-canvas-wrapper">
                <div className="standard-canvas-top">
                    <Tooltip content="Back">
                        <div className="back-to-modules builder" onClick={async () => {await handleSaveQuiz(); navigate(-1);}}> {/* temporary route */}
                            <img src={orange_left_arrow} />
                        </div>
                    </Tooltip>
                    <div className="modules-header lesson-pg">
                        <div className="builder-header-wrapper">
                            <div className="builder-page-title">
                                Builder Studio / Standard Modules / Quiz Builder
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
                            <ActionButton text={saving ? "Saving..." : "Save Quiz"} buttonType={"save"} rounded={true} onClick={handleSaveQuiz} />
                        </div>
                    </div>

                    <div className="module-info-builder">
                        <div className="module-info-line">
                            <span className="module-info-label">LAST MODIFIED</span>
                            <p className="module-info-value">{formatTimestampString(lastModified)}</p>
                        </div>

                        <div className="module-info-line">
                            <span className="module-info-label">TOTAL QUESTIONS</span>
                            <p className="module-info-value">{questions?.length} question{questions?.length !== 1 && "s"}</p> 
                        </div>
                        <div className="builder-filler-space" />
                    </div>
                </div>
                <div className="standard-canvas-bottom">
                    <div className="lesson-title-wrapper standard">
                        <div className="module-info-line lesson">
                            <span className="module-info-icon">
                                <img src={list_icon} />
                            </span>
                            <span className="module-info-label lesson">QUESTIONS</span>
                        </div>
                        {(questions?.length > 0) && 
                        <div className="add-lesson-panel">
                            <button className="add-lesson-btn" onClick={handleAddQuestion}>
                                <div className="add-icon-swap">
                                    <img className="add-icon default" src={white_plus_icon} />
                                    <img className="add-icon hover" src={blue_plus_icon} />
                                </div>
                                Add Question
                            </button>
                        </div>}
                    </div>
                    <div className="lessons-list">
                        {
                            (questions.length === 0) ?
                            <div className="empty-lessons-list">
                                <p>There are currently no questions</p>
                                <button className="add-lesson-btn" onClick={handleAddQuestion}>
                                    <div className="add-icon-swap">
                                        <img className="add-icon default" src={white_plus_icon} />
                                        <img className="add-icon hover" src={blue_plus_icon} />
                                    </div>
                                    Add Question
                                </button>
                                <p>OR</p>
                                <button className="add-lesson-btn ai">
                                    <div className="add-icon-swap">
                                        <img className="add-icon default" src={ai_icon} />
                                    </div>
                                    Generate quiz
                                </button>
                            </div> 
                            : <div className="questions-list">
                                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                                        {questions.map((q, i) => <QuestionCard key={q.id} question={q} onUpdate={updateQuestion}
                                        handleDelete={() => setQuestionToDelete(q)} position={i + 1} />)}
                                    </SortableContext>
                                </DndContext>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};