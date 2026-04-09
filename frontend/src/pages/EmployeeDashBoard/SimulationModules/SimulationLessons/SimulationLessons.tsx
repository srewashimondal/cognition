import './SimulationLessons.css';
import { useState, useEffect } from 'react';
import { Tooltip } from "@radix-ui/themes";
import { useParams, useNavigate } from 'react-router-dom';
import LessonCard from '../../../../cards/LessonCard/LessonCard';
import ActionButton from '../../../../components/ActionButton/ActionButton';
import ProgressBar from '../../../../components/ProgressBar/ProgressBar';
import type { ModuleType } from '../../../../types/Modules/ModuleType';
import type { ModuleAttemptType } from '../../../../types/Modules/ModuleAttemptType';
import type { LessonType } from '../../../../types/Modules/Lessons/LessonType';
import type { LessonAttemptType } from '../../../../types/Modules/Lessons/LessonAttemptType';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from '../../../../firebase';
import {
    collectLessonSimulationFeedback,
    evaluationHasUserFacingContent,
    lessonEvaluationFromAggregatedFeedback,
    storedPartialIsUseful,
} from "../../../../utils/simulationFeedback";
import orange_left_arrow from '../../../../assets/icons/orange-left-arrow.svg';
import clock_icon from '../../../../assets/icons/simulations/black-clock-icon.svg';
import notebook_icon from '../../../../assets/icons/simulations/black-notebook-icon.svg';

export default function SimulationLessons() {
    const navigate = useNavigate();
    const { moduleID } = useParams();
    
    const [loading, setLoading] = useState(false);
    const [moduleAttempt, setModuleAttempt] = useState<ModuleAttemptType | null>(null);
    const [moduleInfo, setModuleInfo] = useState<ModuleType | null>(null);
    const [lessonAttempts, setLessonAttempts] = useState<any[]>([]);

    const isActive = moduleInfo?.deployed === true;
    // const bannerColorByID = ["module1", "module2", "module3", "module4", "module5", "module6"];

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

    useEffect(() => {
        async function fetchModuleAttempt() {
            if (!moduleID) return;
    
            setLoading(true);
    
            try {
                const moduleAttemptRef = doc(db, "simulationModuleAttempts", moduleID);
                const moduleAttemptSnap = await getDoc(moduleAttemptRef);
    
                if (!moduleAttemptSnap.exists()) {
                    console.error("Simulation module attempt not found");
                    return;
                }
    
                const moduleAttemptData = moduleAttemptSnap.data();
                const moduleSnap = await getDoc(moduleAttemptData.moduleInfo);
                if (!moduleSnap.exists()) return;
    
                const builtModuleInfo = {
                    id: moduleSnap.id,
                    ...(moduleSnap.data() as Omit<ModuleType, "id">),
                };
    
                // 🔹 Get lesson attempts
                const lessonSnap = await getDocs(
                    query(
                        collection(db, "simulationLessonAttempts"),
                        where("moduleRef", "==", moduleAttemptRef)
                    )
                );
    
                const lessonAttemptsRaw = await Promise.all(
                    lessonSnap.docs.map(async (docSnap) => {
                        const attemptData = docSnap.data();
    
                        const lessonOriginalSnap = await getDoc(attemptData.lessonInfo);
                        if (!lessonOriginalSnap.exists()) return null;
    
                        const lessonData = lessonOriginalSnap.data();
    
                        return {
                            id: docSnap.id,
                            status: attemptData.status,
                            evaluation: attemptData.evaluation,
                            lessonInfo: {
                                id: lessonOriginalSnap.id,
                                ...lessonData as Omit<LessonType, "id">,
                            }
                        } as LessonAttemptType;
                    })
                );
    
                const filtered = lessonAttemptsRaw.filter((lesson): lesson is LessonAttemptType => lesson !== null);
    
                const sorted = filtered.sort(
                    (a: any, b: any) =>
                        a.lessonInfo.orderNumber - b.lessonInfo.orderNumber
                );
    
                const enriched = sorted.map((lesson: any, index: number) => {
                    if (index === 0) return { ...lesson, isLocked: false };
    
                    const prev = sorted[index - 1];
                    
                    return {
                        ...lesson,
                        isLocked: prev.status !== "completed"
                    };
                    
                });

                const withFeedback = await Promise.all(
                    enriched.map(async (lesson: any) => {
                        if (lesson.status !== "completed") {
                            return lesson;
                        }
                        const fb = await collectLessonSimulationFeedback(
                            db,
                            lesson.id
                        );
                        const evaluation = lessonEvaluationFromAggregatedFeedback(
                            fb,
                            storedPartialIsUseful(lesson.evaluation)
                                ? lesson.evaluation
                                : undefined,
                            { lessonMarkedComplete: true }
                        );
                        if (evaluationHasUserFacingContent(evaluation)) {
                            try {
                                await updateDoc(
                                    doc(db, "simulationLessonAttempts", lesson.id),
                                    { evaluation }
                                );
                            } catch (err) {
                                console.warn("Persist lesson evaluation failed:", err);
                            }
                        }
                        return {
                            ...lesson,
                            evaluation,
                        };
                    })
                );

                const totalLessons = withFeedback.length;
                const completedCount = withFeedback.filter(
                    (l) => l.status === "completed"
                ).length;
                const computedPercent =
                    totalLessons === 0
                        ? 0
                        : Math.round((completedCount / totalLessons) * 100);
    
                setModuleAttempt({
                    id: moduleAttemptSnap.id,
                    moduleInfo: builtModuleInfo,
                    moduleRef: moduleAttemptRef,
                    status: moduleAttemptData.status,
                    percent: computedPercent,
                    lessons: withFeedback
                });
    
                setModuleInfo(builtModuleInfo);
                setLessonAttempts(withFeedback);
    
            } catch (err) {
                console.error("Error fetching simulation module attempt:", err);
            } finally {
                setLoading(false);
            }
        }
    
        fetchModuleAttempt();
    }, [moduleID]);

    const handleSimNavigate = async (moduleID: string, lessonAttemptID: string, status: string) => {
        if (status === "not begun") {
            navigate(`/employee/simulations/${moduleID}/${lessonAttemptID}/1`);
            return;
        }
      
        try {
            const simsRef = collection(
                db,
                "simulationLessonAttempts",
                lessonAttemptID,
                "simulations"
            );
      
            const snap = await getDocs(simsRef);
            const sims = snap.docs.map(d => ({ id: d.id, ...d.data() }))
                .sort((a, b) => {
                    const aNum = Number(a.id.split("_")[1]);
                    const bNum = Number(b.id.split("_")[1]);
                    return aNum - bNum;
                }); 
            const nextIndex = sims.findIndex(
                (s: any) => (s.completionStatus ?? s.status) !== "completed"
            );
            const simIndex = nextIndex === -1 ? sims.length - 1 : nextIndex;
      
            navigate(`/employee/simulations/${moduleID}/${lessonAttemptID}/${simIndex + 1}`);
        } catch (err) {
            console.error("Error fetching simulations:", err);
            navigate(`/employee/simulations/${moduleID}/${lessonAttemptID}/1`);
        }
    }

    const handleModuleReset = () => {
        /* nothing for now */
    };

    return (
        <div className="simulation-lessons-pg">
            <div className="simulation-lessons-top">
                <Tooltip content="Back">
                    <div className="back-to-modules" onClick={() => navigate(`/employee/simulations/`)}>
                        <img src={orange_left_arrow} />
                    </div>
                </Tooltip>
                {/*<div className={`lesson-banner ${bannerColorByID[(moduleInfo?.id ?? 1) - 1]}`} />*/}

                {!isActive &&
                <div className="inactive-banner">
                    <div className="inactive-streak" />
                    <div className="hint-circle">!</div>
                    <div className="inactive-banner-content">
                        This module is no longer active. You can no longer begin new lessons, however you can continue lessons that are still in progress. 
                        {" "}
                        <span>Learn More</span>
                    </div>
                </div>}
        
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
                    navigateToSim={() => handleSimNavigate(moduleID ?? "", l.id, l.status)} 
                    isLocked={l.isLocked} disableButtons={!isActive && l.status === "not begun"} />))}
                </div>

                <div className="employee-action-panel module">
                    <ActionButton text={"Reset Progress"} buttonType={"refresh"} onClick={handleModuleReset} reversed={true} />
                </div>
                <div className="filler-space" />
            </div>
        </div>
    );
}