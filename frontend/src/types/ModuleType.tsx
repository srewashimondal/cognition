import type { LessonType } from './LessonType';

export type ModuleType = {
    id: number;
    title: string;
    hours: string;
    numLessons: number;
    lessons?: LessonType[];
    deployed?: boolean;
};