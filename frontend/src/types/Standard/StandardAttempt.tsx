import type { StandardModuleType } from "./StandardModule";
import type { StandardLessonType } from "./StandardLessons";
import type { QuestionAttemptType } from "./QuizQuestion/QuestionTypes";
import type { SectionSummary } from "./StandardLessons";
import type { MessageType } from "../Modules/Lessons/Simulations/MessageType";

export type SummaryChatThread = {
    summaryIndex: number;   
    messages: MessageType[];
};

export type StandardLessonAttempt = {
    id: string;
    lessonInfo: StandardLessonType;
    status: "not begun" | "started" | "completed";
    questionAnswers?: QuestionAttemptType[];
    score?: number;
    messages?: SummaryChatThread[];
    isLocked?: boolean;
};

export type StandardModuleAttempt = {
    id: string;
    moduleInfo: StandardModuleType;
    status?: "not begun" | "completed" | "started";
    percent?: number;
    lessons?: StandardLessonAttempt[];
    completionDate?: string;
    score?: number;
};