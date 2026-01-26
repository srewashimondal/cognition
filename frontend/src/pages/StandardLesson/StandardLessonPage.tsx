import { useNavigate, useParams } from "react-router-dom";
import VideoLessonPage from "./VideoLesson/VideoLessonPage";
import QuizLessonPage from "./QuizLesson/QuizLessonPage";
import { standardModuleAttempt } from "../../dummy_data/standardAttempt_data";

export default function StandardLessonPage() {
    const navigate = useNavigate();
    const { moduleID, lessonID } = useParams();
    const moduleId = Number(moduleID);
    const lessonId = Number(lessonID);
    const moduleAttempt = standardModuleAttempt.find(m => m.moduleInfo.id === moduleId);
    const lessonAttempts = moduleAttempt?.lessons;
    const lessonAttempt = lessonAttempts?.find(l => l.lessonInfo.id === lessonId);
    const lesson = lessonAttempt?.lessonInfo;
    const moduleTitle = moduleAttempt?.moduleInfo.title;

    const handleBack = () => {
        navigate(`/employee/standard-modules/${moduleId}`);
    };

    if (!lesson) return <div>Lesson not found</div>;

    switch (lesson.type) {
        case "video":
        return <VideoLessonPage lesson={lesson} handleBack={handleBack} moduleTitle={moduleTitle ?? ""} />;

        case "quiz":
        return <QuizLessonPage />;

        default:
        return <div>Unsupported lesson type</div>;
    }
}