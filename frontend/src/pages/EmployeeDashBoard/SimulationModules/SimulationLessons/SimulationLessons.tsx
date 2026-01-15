import './SimulationLessons.css';
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LessonCard from '../../../../cards/LessonCard/LessonCard';
import ActionButton from '../../../../components/ActionButton/ActionButton';
// dummy data
import { moduleAttempts } from '../../../../dummy_data/modulesAttempt_data';
import orange_left_arrow from '../../../../assets/icons/orange-left-arrow.svg';


export default function SimulationLessons() {
    const navigate = useNavigate();
    const { moduleID } = useParams();
    const id = Number(moduleID);

    /* replace this line with backend logic later */
    const moduleAttempt = moduleAttempts.find(m => m.moduleInfo.id === id);
    const moduleInfo = moduleAttempt?.moduleInfo;
    const lessonAttempts = moduleAttempt?.lessons;
    const bannerColorByID = ["module1", "module2", "module3", "module4", "module5", "module6"];

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

    const handleSimNavigate = (moduleID: number, lessonID: number, status: string) => {
        if (status === "not begun") {
            navigate(`/employee/simulations/${moduleID}/${lessonID}/1`);
            return;
        }
        const lessonAttempt = moduleAttempt?.lessons?.find(l => l.lessonInfo.id === lessonID);
        const nextSimIndex = lessonAttempt?.simulations?.findIndex(s => s.status !== "completed") ?? 0;
        navigate(`/employee/simulations/${moduleID}/${lessonID}/${nextSimIndex + 1}`);
    };

    const handleModuleReset = () => {
        /* nothing for now */
    };

    return (
        <div className="simulation-lessons-pg">
            <div className="back-to-modules" onClick={() => navigate(`/employee/simulations`)}>
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
                {lessonAttempts?.map((l) => (<LessonCard lessonInfo={l.lessonInfo} 
                role={"employee"} status={l.status} evaluation={l.evaluation} 
                navigateToSim={() => handleSimNavigate(id, l.lessonInfo.id, l.status)} />))}
            </div>

            <div className="employee-action-panel module">
                <ActionButton text={"Reset Progress"} buttonType={"refresh"} onClick={handleModuleReset} reversed={true} />
            </div>
            <div className="filler-space" />
        </div>
    );
}