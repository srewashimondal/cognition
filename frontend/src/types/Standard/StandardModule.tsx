import type { StandardLessonType } from "./StandardLessons.tsx";
import type { DocumentReference } from "firebase/firestore";

export type StandardModuleType = {
  id: string;
  title: string;
  hours: string;
  numLessons: number;
  lessons: StandardLessonType[];
  lessonRefs: DocumentReference[];
  deployed?: boolean;
  createTime: string;
  kind: "standard";
  lastModified?: string;
};
