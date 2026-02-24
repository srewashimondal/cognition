import type { LessonType } from './Lessons/LessonType';
import type { DocumentReference } from "firebase/firestore";

export type ModuleType = {
    id: string;
    title: string;
    hours: string;
    numLessons: number;
    lessons?: LessonType[];
    deployed?: boolean;
    createTime: string;
    difficulty: string;
    references: DocumentReference[]; // change to File later
    kind: "simulation";
    lastModified?: string;
    orderNumber: number;
};