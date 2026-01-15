import type { ModuleType } from "./ModuleType";
import type { LessonAttemptType } from "./Lessons/LessonAttemptType";

export type ModuleAttemptType = {
    attempt_id: number;
    moduleInfo: ModuleType;
    status?: "not begun" | "completed" | "started";
    percent?: number;
    lessons?: LessonAttemptType[];
}