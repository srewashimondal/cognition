import './QuizBuilder.css';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ActionButton from '../../../../components/ActionButton/ActionButton';
import QuestionCard from '../../../../cards/QuestionCard/QuestionCard';
import type { QuizQuestionType } from '../../../../types/Standard/QuizQuestion/QuestionTypes';
import { standardModule } from '../../../../dummy_data/standard_data';
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
    const navigate = useNavigate();
    const { moduleID, quizID } = useParams();
    const isNewDraft = !moduleID;
    const moduleId = !isNewDraft ? Number(moduleID) : null;
    const quizId = !isNewDraft ? Number(quizID) : null;
    const module = !isNewDraft ? standardModule.find(m => m.id === moduleId) : null;
    const quiz = !isNewDraft ? module?.lessons.find(l => (l.type === "quiz" && l.id === quizId)) : null;
    const questionsList = (quiz && quiz.type === "quiz") ? quiz?.questions : null;

    const [editMode, setEditMode] = useState(false);
    const [title, setTitle] = useState(quiz?.title ?? "New Quiz Title");
    const [questions, setQuestions] = useState<QuizQuestionType[]>(questionsList ?? []);
    const [questionToDelete, setQuestionToDelete] = useState<QuizQuestionType | null>(null);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

    const handleAddQuestion = () => {
        setQuestions(prev => {
            const lastId = prev.length > 0 ? prev[prev.length - 1].id : 0;

            const newQuestion: QuizQuestionType = {
                id: lastId + 1,
                prompt: "",
                type: "mcq",
                options: ["Choice 1", "Choice 2"],
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
        setQuestions((prev) =>
            prev.map((q) =>
            q.id === id ? { ...q, ...updates } : q
        ));
    };
    
    const handleBack = () => {
        if (moduleId) {
            navigate(`/employer/modules/standard-builder/${moduleID}`);
            return;
        }
        navigate(`/employer/modules/standard-builder`);
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
            <div className="standard-canvas-wrapper">
                <div className="standard-canvas-top">
                    <Tooltip content="Back">
                        <div className="back-to-modules builder" onClick={() => navigate(-1)}> {/* temporary route */}
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
                            <ActionButton text={"Save Quiz"} buttonType={"save"} rounded={true}  />
                        </div>
                    </div>

                    <div className="module-info-builder">
                        <div className="module-info-line">
                            <span className="module-info-label">CREATED</span>
                            <p className="module-info-value">January 16, 2025 10:00AM</p>
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