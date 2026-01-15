import type { ModuleType } from "./ModuleType";
import type { LessonAttemptType } from "./Lessons/LessonAttemptType";

export type ModuleAttemptType = {
    moduleInfo: ModuleType;
    status?: "not begun" | "completed" | "started";
    percent?: number;
    lessons?: LessonAttemptType[];
}