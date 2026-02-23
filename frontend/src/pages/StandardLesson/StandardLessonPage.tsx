import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VideoLessonPage from "./VideoLesson/VideoLessonPage";
import QuizLessonPage from "./QuizLesson/QuizLessonPage";
import type { StandardLessonAttempt } from "../../types/Standard/StandardAttempt";
import type { StandardModuleType } from "../../types/Standard/StandardModule";
import type { StandardLessonType } from "../../types/Standard/StandardLessons";
// import { standardModuleAttempt } from "../../dummy_data/standardAttempt_data";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from '../../firebase';

export default function StandardLessonPage() {
    const navigate = useNavigate();
    const { moduleID, lessonID } = useParams();
    const [lessonAttempt, setLessonAttempt] = useState<StandardLessonAttempt | null>(null);
    const [moduleTitle, setModuleTitle] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLesson() {
            if (!moduleID || !lessonID) return;
            setLoading(true);

            try {
                const moduleAttemptRef = doc(db, "standardModuleAttempts", moduleID);
                const moduleAttemptSnap = await getDoc(moduleAttemptRef);
                if (!moduleAttemptSnap.exists()) return;
                const moduleAttemptData = moduleAttemptSnap.data();

                const moduleSnap = await getDoc(moduleAttemptData.moduleInfo);
                if (moduleSnap.exists()) {
                    const moduleData = moduleSnap.data() as Omit<StandardModuleType, "id">;
                    setModuleTitle(moduleData.title);
                }

                const lessonQuerySnap = await getDocs(
                    query(
                        collection(db, "standardLessonAttempts"),
                        where("moduleRef", "==", moduleAttemptRef)
                    )
                );

                const lessonAttemptsData = await Promise.all(
                    lessonQuerySnap.docs.map(async (docSnap) => {
                    const attemptData = docSnap.data();
                    const lessonOriginalSnap = await getDoc(attemptData.lessonInfo);

                    if (!lessonOriginalSnap.exists()) return null;

                    const lessonData =
                        lessonOriginalSnap.data() as Omit<StandardLessonType, "id">;

                    return {
                        id: docSnap.id,
                        status: attemptData.status,
                        questionAnswers: attemptData.questionAnswers ?? [],
                        score: attemptData.score,
                        lessonInfo: {
                            id: lessonOriginalSnap.id,
                            ...lessonData,
                        },
                    } as StandardLessonAttempt;
                    })
                );

                const filtered = lessonAttemptsData.filter(Boolean) as StandardLessonAttempt[];
                const found = filtered.find((l) => l.id === lessonID);

                setLessonAttempt(found ?? null);
            } catch (error) {
                console.error("Error fetching lesson:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchLesson();
    }, [moduleID, lessonID]);
    

    const handleBack = () => {
        navigate(`/employee/standard-modules/${moduleID}`);
    };

    if (!lessonAttempt) return null;

    switch (lessonAttempt.lessonInfo.type) {
        case "video":
            return <VideoLessonPage lessonAttempt={lessonAttempt} lesson={lessonAttempt.lessonInfo} handleBack={handleBack} moduleTitle={moduleTitle ?? ""} />;

        case "quiz":
            return <QuizLessonPage lessonAttempt={lessonAttempt} handleBack={handleBack} moduleTitle={moduleTitle ?? ""} />;

        default:
            return <div>Unsupported lesson type</div>;
    }
}