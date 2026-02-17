import './EmployeeCard.css';
import type { StandardLessonType } from '../../../types/Standard/StandardLessons';
import movie_icon from '../../../assets/icons/simulations/grey-movie-icon.svg';
import quiz_icon from '../../../assets/icons/simulations/grey-quiz-icon.svg';
import clock_icon from '../../../assets/icons/simulations/black-clock-icon.svg';
import calendar_icon from '../../../assets/icons/black-calendar-check-icon.svg';
import green_check from '../../../assets/icons/green-check-icon.svg';
import play_button from '../../../assets/icons/video-play-icon.svg';
import lock_icon from '../../../assets/icons/simulations/black-lock-icon.svg';
import orange_left_arrow from '../../../assets/icons/orange-left-arrow.svg';

type EmployeeCardProps = {
    lesson: StandardLessonType;
    status?: "not begun" | "started" | "completed";
    isLocked?: boolean;
    handleNavigate: () => void;
};

export default function EmployeeCard({ lesson, status, isLocked, handleNavigate }: EmployeeCardProps) {
    return (
        <div className={`employee-card-item status-${status} ${isLocked ? "locked" : ""} lesson-${lesson.type}`} onClick={() => {if (!isLocked) {handleNavigate();}}}>
            {(lesson.type === "video") &&
            <div className="card-thumbnail-wrapper">
                <div className="card-thumbnail">
                    <img src={lesson.thumbnailUrl} />
                </div>
                <img className="play-button" src={play_button} onClick={handleNavigate} />
            </div>}
            <div className="card-content">
                <div className="lesson-tag-wrapper">
                    <span>
                        <img src={lesson.type === "video" ? movie_icon : quiz_icon} />
                    </span>
                    <p className="lesson-tag employer">{lesson.orderNumber}. {lesson.type === "video" && "Video Lesson"} {lesson.type === "quiz" && "Quiz"}</p>
                </div>
                <div className="card-title">
                    {lesson.title}
                </div>
                {(isLocked) && <div className="locked-instr">Complete previous lessons to unlock</div>}
                <div className="card-meta">
                    {(status === "completed") && <div className="card-meta-item complete">
                        <span>
                            <img src={green_check} />
                        </span>
                        Completed
                    </div>}
                    <div className="card-meta-item">
                        <span>
                            <img src={clock_icon} />
                        </span>
                        {lesson.duration} min
                    </div>
                    {(status !== "completed") && <div className="card-meta-item">
                        <span>
                            <img src={calendar_icon} />
                        </span>
                        Complete by {lesson.dueDate}
                    </div>}
                </div>
            </div>
            {(lesson.type === "quiz" && status !== "completed" && !isLocked) &&
            <div className="builder-action-pill quiz">
                Begin Quiz
                <span>
                    <img src={orange_left_arrow} />
                </span>
            </div>}
            {(lesson.type === "quiz" && status === "completed") &&
            <div className="builder-action-pill">
                Review
            </div>}
            {(isLocked) &&
            <div className="locked-tag">  
                <span>
                    <img src={lock_icon} />
                </span>
                Locked
            </div>    
            }
        </div>
    );
};