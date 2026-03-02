import type { LessonType } from "./LessonType";
import type { LessonEvaluationType } from "./LessonEvaluationType";
import type { SimulationAttemptType } from "./Simulations/SimulationAttemptType";
import type { DocumentReference } from "firebase/firestore";

export type LessonAttemptType = {
    id: string;
    lessonInfo: LessonType;
    lessonRef: DocumentReference;
    moduleRef: DocumentReference;
    status: "not begun" | "started" | "completed";
    evaluation?: LessonEvaluationType;
    simulations?: SimulationAttemptType[];
    isLocked?: boolean;
};