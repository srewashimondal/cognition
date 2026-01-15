import './SimulationLessons.css';
import { useParams, useNavigate } from 'react-router-dom';
import LessonCard from '../../../../cards/LessonCard/LessonCard';
// dummy data
import { moduleAttempts } from '../../../../dummy_data/modulesAttempt_data';
import orange_left_arrow from '../../../../assets/icons/orange-left-arrow.svg';


export default function SimulationLessons() {
    const navigate = useNavigate();
    const { id } = useParams();
    const moduleId = Number(id);

    /* replace this line with backend logic later */
    const moduleAttempt = moduleAttempts.find(m => m.moduleInfo.id === moduleId);
    const moduleInfo = moduleAttempt?.moduleInfo;
    const lessonAttempts = moduleAttempt?.lessons;
    const bannerColorByID = ["module1", "module2", "module3", "module4", "module5", "module6"];

    return (
        <div className="simulation-lessons-pg">
            <div className="back-to-modules" onClick={() => navigate(`/employee/simulation-modules`)}>
                <img src={orange_left_arrow} />
            </div>

            <div className={`lesson-banner ${bannerColorByID[(moduleInfo?.id ?? 1) - 1]}`} />
      
            <div className="modules-header lesson-pg">
                <div>
                <h1>{moduleInfo?.title}</h1>
                <p>View and manage your course lessons.</p>
                </div>
            </div>

            <div className="lessons-list-header-employer">
                <div className="list-header-section lsn employee">Lesson</div>
                <div className="list-header-section employee">{/*Filler*/}</div>
                <div className="list-header-section employee">Duration</div>
                <div className="list-header-section employee">Due Date</div>
                <div className="list-header-section employee">Status</div>
                <div className="list-header-section employee">{/*Filler*/}</div>
            </div>

            <div className="lessons-list">
                {lessonAttempts?.map((l) => (<LessonCard lessonInfo={l.lessonInfo} role={"employee"} status={l.status} evaluation={l.evaluation} />))}
            </div>

        </div>
    );
}