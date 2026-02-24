import type { LessonAbstractType } from "./LessonAbstractType";

export type LessonType = {
    id: string;
    title: string;
    type: "simulation" | "standard";
    skills: string[];
    duration: number;
    dueDate: string | null;
    allowUnlimitedAttempts: boolean;
    numAttempts?: number;
    lessonAbstractInfo?: LessonAbstractType;
    orderNumber: number;
    criteria?: string[];
    customerMood?: number;
};
  