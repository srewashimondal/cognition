import type { QuizQuestionType } from "./QuizQuestion/QuestionTypes";
import type { TranscriptType } from "./TranscriptType";
import type { MessageType } from "../Modules/Lessons/Simulations/MessageType";

export type SectionSummary = {
    id: string;
    title: string;
    start: number;
    end: number;
    canonicalSummary: MessageType;
};

export type VideoLessonType = {
    id: string;
    isTemp?: boolean;
    orderNumber: number;
    title: string;
    type: "video";
    duration?: number;
    dueDate?: string | null;
    videoFilePath?: string;   
    pendingVideoFile?: File;     
    filename?: string;
    durationSeconds?: number;
    thumbnailUrl?: string;     
    transcript?: TranscriptType[];      
    requireCompletion?: boolean;  
    allowPlaybackSpeed?: boolean;
    summaries?: SectionSummary[];
    allowTranscript?: boolean;
    allowSummary?: boolean;
};

export type QuizLessonType = {
    id: string;
    isTemp?: boolean;
    orderNumber: number;
    title: string;
    type: "quiz";
    timeLimitMode?: "unlimited" | "custom";
    timeLimitHour?: number;
    timeLimitMinute?: number;
    duration?: number;
    dueDate?: string | null;
    questions?: QuizQuestionType[];
    passingScore?: number;
    retakeMode?: "unlimited" | "custom";
    numberOfRetakes?: number;
};

export type StandardLessonType = VideoLessonType | QuizLessonType;