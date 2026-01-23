import type { BaseQuizQuestion } from "./BaseQuestionType";

export type MCQType = BaseQuizQuestion & {
    type: "mcq";
    allowMultiple?: boolean;
    options?: string[];
    correctAnswerIndex?: number;
    correctAnswerIndices?: number[];
};

export type TrueFalseQuestionType = BaseQuizQuestion & {
    type: "true false";
    correctAnswer?: boolean;
};

export type OpenEndedQuestionType = BaseQuizQuestion & {
    type: "open ended";
    rubric?: string;
    maxLength?: number;
};

export type QuizQuestionType = MCQType | TrueFalseQuestionType | OpenEndedQuestionType;

  