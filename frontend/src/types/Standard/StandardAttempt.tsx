import type { StandardModuleType } from "./StandardModule";
import type { StandardLessonType } from "./StandardLessons";

export type StandardLessonAttempt = {
    attempt_id: number;
    lessonInfo: StandardLessonType;
    status: "not begun" | "started" | "completed" | "locked";
};

export type StandardModuleAttempt = {
    attempt_id: number;
    moduleInfo: StandardModuleType;
    status?: "not begun" | "completed" | "started";
    percent?: number;
    lessons?: StandardLessonAttempt[];
};