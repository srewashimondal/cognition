import type { QuizQuestionType } from "./QuizQuestion/QuestionTypes";
import type { TranscriptType } from "./TranscriptType";

export type VideoLessonType = {
    id: number;
    title: string;
    type: "video";
    duration?: number;
    dueDate?: string;
    videoFileId?: string;        
    filename?: string;
    durationSeconds?: number;
    thumbnailUrl?: string;     
    transcript?: TranscriptType[];      
    requireCompletion?: boolean;  
    allowPlaybackSpeed?: boolean;
};

export type QuizLessonType = {
  id: number;
  title: string;
  type: "quiz";
  duration?: number;
  dueDate?: string;
  questions?: QuizQuestionType[];
  passingScore?: number;
  allowRetake?: boolean;
};

export type StandardLessonType = VideoLessonType | QuizLessonType;