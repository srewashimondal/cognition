import './StandardBuilder.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActionButton from '../../../components/ActionButton/ActionButton';
import EmployerCard from '../../../cards/StandardLesson/EmployerCard/EmployerCard';
import type { StandardLessonType } from '../../../types/Standard/StandardLessons';
import orange_left_arrow from '../../../assets/icons/orange-left-arrow.svg';
import edit_icon from '../../../assets/icons/simulations/grey-edit-icon.svg';
import check_icon from '../../../assets/icons/simulations/grey-check-icon.svg';
import file_icon from '../../../assets/icons/simulations/grey-file-icon.svg';
import cap_icon from '../../../assets/icons/simulations/black-cap-icon.svg';
import white_plus_icon from '../../../assets/icons/simulations/white-plus-icon.svg';
import blue_plus_icon from '../../../assets/icons/simulations/blue-plus-icon.svg';

export default function StandardBuilder() {
    const navigate = useNavigate();

    const [editMode, setEditMode] = useState(false);
    const [title, setTitle] = useState("New Module Title");
    const [lessons, setLessons] = useState<StandardLessonType[]>([]);
    const [lessonToDelete, setLessonToDelete] = useState<StandardLessonType | null>(null);

    const handleDeploy = () => {
        /* Nothing for now */
    };

    const handleSave = () => {
        /* Nothing for now */
    };

    const handleAddVideo = () => {
        setLessons(prev => {
            const lastId = prev.length > 0 ? prev[prev.length - 1].id : 0;

            const newLesson: StandardLessonType = {
                id: lastId + 1,
                title: "New Lesson Title",
                type: "video"
            };

            return [...prev, newLesson];
        });
    };

    const handleDelete = (lessonToDelete: StandardLessonType) => {
        setLessons((prev) => prev.filter((l) => l.id !== lessonToDelete.id));
        setLessonToDelete(null);
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
                    <div className="back-to-modules builder" onClick={() => navigate(`/employer/modules`)}>
                        <img src={orange_left_arrow} />
                    </div>
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
                            <div className="builder-action" onClick={() => setEditMode(prev => !prev)}>
                                <img src={editMode ? check_icon : edit_icon} />
                            </div>
                            <div className="builder-action-pill" onClick={handleSave}>
                                <span>
                                    <img src={file_icon} />
                                </span>
                                Save as Draft
                            </div>
                            <ActionButton text={"Deploy"} buttonType={"deploy"} onClick={handleDeploy}  />
                        </div>
                    </div>

                    <div className="module-info-builder">
                        <div className="module-info-line">
                            <span className="module-info-label">CREATED</span>
                            <p className="module-info-value">January 16, 2025 10:00AM</p>
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
                            <button className="add-lesson-btn">
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
                            {lessons.map((l) => <EmployerCard id={l.id} title={l.title} type={l.type} handleDelete={() => setLessonToDelete(l)}/>)}
                            </>
                        }
                    </div>
                    <div className="filler-space" /> 
                </div>
            </div>
        </div>
    );
}