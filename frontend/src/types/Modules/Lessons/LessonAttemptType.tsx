import type { LessonType } from "./LessonType";
import type { LessonEvaluationType } from "./LessonEvaluationType";
import type { SimulationAttemptType } from "./Simulations/SimulationAttemptType";

export type LessonAttemptType = {
    id: string;
    lessonInfo: LessonType;
    status: "not begun" | "started" | "completed";
    evaluation?: LessonEvaluationType;
    simulations?: SimulationAttemptType[];
    isLocked?: boolean;
};