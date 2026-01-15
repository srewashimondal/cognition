import type { LessonType } from "./LessonType";
import type { LessonEvaluationType } from "./LessonEvaluationType";

export type LessonAttemptType = {
    lessonInfo: LessonType;
    status: "not begun" | "started" | "completed";
    evaluation?: LessonEvaluationType;
};