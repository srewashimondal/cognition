import type { QuizQuestionType } from "./QuizQuestion/QuestionTypes";

export type VideoLessonType = {
    videoFileId: string;        
    filename: string;
    durationSeconds: number;
    thumbnailUrl?: string;     
    transcript?: string[];      
    requireCompletion?: boolean;  
    allowPlaybackSpeed?: boolean;
};

export type QuizLessonType = {
  questions: QuizQuestionType[];
  passingScore?: number;
  allowRetake?: boolean;
};

export type StandardLessonType = {
  id: number;
  type: "video" | "quiz";
  title: string;
  duration?: number;
  dueDate?: string;
  content?: VideoLessonType | QuizLessonType;
};