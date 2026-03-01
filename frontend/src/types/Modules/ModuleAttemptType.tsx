import type { ModuleType } from "./ModuleType";
import type { LessonAttemptType } from "./Lessons/LessonAttemptType";
import type { DocumentReference } from "firebase/firestore";

export type ModuleAttemptType = {
    id: string;
    moduleInfo: ModuleType;
    moduleRef: DocumentReference;
    status?: "not begun" | "completed" | "started";
    percent?: number;
    lessons?: LessonAttemptType[];
    completionDate?: string;
    score?: number;
}