import type { LessonAbstractType } from "./LessonAbstractType";

export type LessonType = {
    id: number;
    title: string;
    type: "simulation" | "standard";
    skills: string[];
    duration: number;
    dueDate: string;
    numAttempts: number | "unlimited";
    randomize?: boolean;
    lessonAbstractInfo: LessonAbstractType;
};
  