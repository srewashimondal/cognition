import type { StandardLessonType } from "./StandardLessons.tsx";

export type StandardModuleType = {
  id: number;
  title: string;
  hours: string;
  numLessons: number;
  lessons: StandardLessonType[];
  deployed?: boolean;
  createTime: string;
};
