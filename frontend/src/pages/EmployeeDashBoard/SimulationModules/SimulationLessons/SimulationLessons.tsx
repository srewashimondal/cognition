import './SimulationLessons.css';
import { useEffect } from 'react';
import { Tooltip } from "@radix-ui/themes";
import { useParams, useNavigate } from 'react-router-dom';
import LessonCard from '../../../../cards/LessonCard/LessonCard';
import ActionButton from '../../../../components/ActionButton/ActionButton';
import ProgressBar from '../../../../components/ProgressBar/ProgressBar';
// dummy data
import { moduleAttempts } from '../../../../dummy_data/modulesAttempt_data';
import orange_left_arrow from '../../../../assets/icons/orange-left-arrow.svg';
import clock_icon from '../../../../assets/icons/simulations/black-clock-icon.svg';
import notebook_icon from '../../../../assets/icons/simulations/black-notebook-icon.svg';

export default function SimulationLessons() {
    const navigate = useNavigate();
    const { moduleID } = useParams();
    const id = Number(moduleID);

    /* replace this line with backend logic later */
    const moduleAttempt = moduleAttempts.find(m => m.moduleInfo.id === id);
    const moduleInfo = moduleAttempt?.moduleInfo;
    const lessonAttempts = moduleAttempt?.lessons;
    // const bannerColorByID = ["module1", "module2", "module3", "module4", "module5", "module6"];

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
            <div className="simulation-lessons-top">
                <Tooltip content="Back">
                    <div className="back-to-modules" onClick={() => navigate(-1)}>
                        <img src={orange_left_arrow} />
                    </div>
                </Tooltip>
                {/*<div className={`lesson-banner ${bannerColorByID[(moduleInfo?.id ?? 1) - 1]}`} />*/}
        
                <div className="modules-header lesson-pg employee">
                    <div className="modules-header-left">
                        <div className="builder-page-title">
                            Simulation Modules / Module View
                        </div>
                        <h1>{moduleInfo?.title}</h1>
                        <div className="module-meta-bottom">
                            <div className="module-meta-item">
                                <span>
                                    <img src={clock_icon} />
                                </span>
                                {moduleInfo?.hours} hrs
                            </div>
                            <div className="module-meta-item">
                                <span>
                                    <img src={notebook_icon} />
                                </span>
                                {lessonAttempts?.length} lessons
                            </div>
                            <div className={`difficulty-pill employee ${moduleInfo?.difficulty}`}>{moduleInfo?.difficulty}</div>
                        </div>
                    </div>
                    <div className="modules-header-right">
                        <ProgressBar percent={moduleAttempt?.percent ?? 0} style={true} style1={true} />
                    </div>
                </div>
            </div>

            <div className="simulation-lessons-bottom">
                <div className="lessons-list-header-employer">
                    <div className="list-header-section lsn employee">Lesson</div>
                    <div className="list-header-section employee">{/*Filler*/}</div>
                    <div className="list-header-section employee dur">Duration</div>
                    <div className="list-header-section employee">Due Date</div>
                    <div className="list-header-section employee dur">Status</div>
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
        </div>
    );
}