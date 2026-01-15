import type { LessonType } from './Lessons/LessonType';

export type ModuleType = {
    id: number;
    title: string;
    hours: string;
    numLessons: number;
    lessons?: LessonType[];
    deployed?: boolean;
};