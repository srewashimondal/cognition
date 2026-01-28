import type { QuizQuestionType } from "./QuizQuestion/QuestionTypes";
import type { TranscriptType } from "./TranscriptType";
import type { MessageType } from "../Modules/Lessons/Simulations/MessageType";

export type SectionSummary = {
    id: number;
    title: string;
    start: number;
    end: number;
    canonicalSummary: MessageType;
};

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
    summaries?: SectionSummary[];
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
    numberOfRetakes?: number;
};

export type StandardLessonType = VideoLessonType | QuizLessonType;