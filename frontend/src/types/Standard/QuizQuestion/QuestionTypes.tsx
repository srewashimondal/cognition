import type { BaseQuizQuestion } from "./BaseQuestionType";

export type MCQType = BaseQuizQuestion & {
    type: "mcq";
    options: string[];
    correctAnswerIndex: number;
  };

export type TrueFalseQuestionType = BaseQuizQuestion & {
    type: "true_false";
    correctAnswer: boolean;
};

export type OpenEndedQuestionType = BaseQuizQuestion & {
    type: "open_ended";
    rubric?: string;
    maxLength?: number;
};

export type QuizQuestionType = MCQType | TrueFalseQuestionType | OpenEndedQuestionType;

  