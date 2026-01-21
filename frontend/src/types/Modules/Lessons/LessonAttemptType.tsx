import type { LessonType } from "./LessonType";
import type { LessonEvaluationType } from "./LessonEvaluationType";
import type { SimulationAttemptType } from "./Simulations/SimulationAttemptType";

export type LessonAttemptType = {
    attempt_id: number;
    lessonInfo: LessonType;
    status: "not begun" | "started" | "completed" | "locked";
    evaluation?: LessonEvaluationType;
    simulations?: SimulationAttemptType[];
};