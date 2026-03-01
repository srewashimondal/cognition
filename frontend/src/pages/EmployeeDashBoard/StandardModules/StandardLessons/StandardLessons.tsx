import './StandardLessons.css';
import { Tooltip } from "@radix-ui/themes";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProgressBar from '../../../../components/ProgressBar/ProgressBar';
import EmployeeCard from '../../../../cards/StandardLesson/EmployeeCard/EmployeeCard';
// import { standardModuleAttempt } from '../../../../dummy_data/standardAttempt_data';
import type { StandardModuleType } from '../../../../types/Standard/StandardModule';
import type { StandardLessonType } from '../../../../types/Standard/StandardLessons';
import type { StandardLessonAttempt, StandardModuleAttempt } from '../../../../types/Standard/StandardAttempt';
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from '../../../../firebase';
import type { StoredQuestionAnswer } from '../../../../utils/quizScore';
import { hydrateQuestionAnswers } from '../../../../utils/quizScore';
import type { QuizQuestionType } from '../../../../types/Standard/QuizQuestion/QuestionTypes';
import orange_left_arrow from '../../../../assets/icons/orange-left-arrow.svg';
import clock_icon from '../../../../assets/icons/simulations/black-clock-icon.svg';
import notebook_icon from '../../../../assets/icons/simulations/black-notebook-icon.svg';

export default function StandardLessons() {
    const navigate = useNavigate();
    const { moduleID } = useParams();

    // const moduleAttempt = standardModuleAttempt.find(m => m.moduleInfo.id === id);
    // const moduleInfo = moduleAttempt?.moduleInfo;
    // const lessonAttempts = moduleAttempt?.lessons;

    const [loading, setLoading] = useState(false);
    const [module, setModule] = useState<StandardModuleAttempt | null>(null);
    const [moduleInfo, setModuleInfo] = useState<StandardModuleType | null>(null);
    const [lessonAttempts, setLessonAttempts] = useState<StandardLessonAttempt[]>([]);

    useEffect(() => {
        async function fetchModuleAttempt() {
            if (!moduleID) return;
            setLoading(true);
      
            try {
                const moduleAttemptRef = doc(db, "standardModuleAttempts", moduleID);
                const moduleAttemptSnap = await getDoc(moduleAttemptRef);
        
                if (!moduleAttemptSnap.exists()) {
                    console.error("Module attempt not found");
                    setLoading(false);
                    return;
                }
        
                const moduleAttemptData = moduleAttemptSnap.data();
                const moduleSnap = await getDoc(moduleAttemptData.moduleInfo);
                let moduleData: StandardModuleType | null = null;
            
                if (moduleSnap.exists()) {
                    moduleData = {
                    id: moduleSnap.id,
                    ...(moduleSnap.data() as Omit<StandardModuleType, "id">),
                    };
                }
        
                const lessonSnap = await getDocs(
                    query(
                        collection(db, "standardLessonAttempts"),
                        where("moduleRef", "==", moduleAttemptRef)
                    ));
                
                const lessonAttempts = await Promise.all(
                lessonSnap.docs.map(async (docSnap) => {
                    const attemptData = docSnap.data();
                    const lessonOriginalSnap = await getDoc(attemptData.lessonInfo);
                
                    if (!lessonOriginalSnap.exists()) return null;
                
                    const lessonData = lessonOriginalSnap.data() as Omit<StandardLessonType, "id">;
                
                    return {
                        id: docSnap.id,
                        status: attemptData.status,
                        questionAnswers: hydrateQuestionAnswers(
                            attemptData.questionAnswers as StoredQuestionAnswer[] | undefined,
                            lessonData.type === "quiz"
                                ? (lessonData as { questions?: QuizQuestionType[] }).questions
                                : undefined
                        ),
                        score: attemptData.score,
                        passed: attemptData.passed,
                        completedAt: attemptData.completedAt,
                        lessonInfo: {
                            id: lessonOriginalSnap.id,
                            ...lessonData,
                        },
                    } as StandardLessonAttempt;
                })
                );
                
                const filteredLessonAttempts = lessonAttempts.filter(Boolean) as StandardLessonAttempt[];
                const sorted = filteredLessonAttempts.sort((a, b) => a.lessonInfo.orderNumber - b.lessonInfo.orderNumber);
                const enriched = sorted.map((lesson, index) => {
                    if (index === 0) {
                        return { ...lesson, isLocked: false };
                    }
                    const prev = sorted[index - 1];
                  
                    return {
                      ...lesson,
                      isLocked: prev.status !== "completed",
                    };
                });

                const builtModuleInfo = {
                    id: moduleSnap.id,
                    ...(moduleSnap.data() as Omit<StandardModuleType, "id">),
                };
                
                setModule({
                    id: moduleAttemptSnap.id,
                    moduleInfo: builtModuleInfo,
                    status: moduleAttemptData.status,
                    percent: moduleAttemptData.percent,
                    score: moduleAttemptData.score,
                    completionDate: moduleAttemptData.completionDate,
                    lessons: filteredLessonAttempts,
                });
                
                setModuleInfo(builtModuleInfo);
                setLessonAttempts(enriched);
            } catch (error) {
                console.error("Error fetching module attempt:", error);
            } finally {
                setLoading(false);
            }
        }
      
        fetchModuleAttempt();
    }, [moduleID]); 
      
    const handleNavigate = (moduleId: string | undefined, lessonId: string) => {
        navigate(`/employee/standard-modules/${moduleId}/${lessonId}`);
    };

    console.log("moduleInfo:", moduleInfo);
    console.log("lessonAttempts:", lessonAttempts);

    const total = lessonAttempts.length;
    const completed = lessonAttempts.filter(l => l.status === "completed").length;
    const percentCompleted = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <div className="standard-lessons-page">
            <div className="simulation-lessons-top">
                <Tooltip content="Back">
                    <div className="back-to-modules" onClick={() => navigate(`/employee/standard-modules`)}>
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
                        </div>
                    </div>
                    <div className="modules-header-right">
                        <ProgressBar percent={percentCompleted} style={true} style1={true} />
                    </div>
                </div>
            </div>
            <div className="simulation-lessons-bottom">
                <div className="lessons-list-header-employer standard">
                    <div className="list-header-section lsn employee standard">Lesson</div>
                </div>
                <div className="lessons-list">
                    {lessonAttempts.map((l) => (<EmployeeCard lesson={l.lessonInfo} status={l.status} isLocked={l.isLocked} handleNavigate={() => handleNavigate(moduleID, l.id)}/>))}
                </div>
            </div>
            <div className="filler-space" />
        </div>
    );
}