import type { LessonType } from './Lessons/LessonType';

export type ModuleType = {
    id: string;
    title: string;
    hours: string;
    numLessons: number;
    lessons?: LessonType[];
    deployed?: boolean;
    createTime: string;
    difficulty: string;
    references: string[]; // change to File later
    kind: "simulation";
    lastModified?: string;
    orderNumber: number;
};