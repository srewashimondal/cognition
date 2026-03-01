import type { QuizQuestionType } from '../types/Standard/QuizQuestion/QuestionTypes';
import type { QuestionAttemptType } from '../types/Standard/QuizQuestion/QuestionTypes';

export type StoredQuestionAnswer = {
  questionId: number;
  answer: number | boolean | string;
};

export function isAnswerCorrect(question: QuizQuestionType, answer: number | boolean | string): boolean {
  switch (question.type) {
    case 'mcq':
      if (question.allowMultiple) {
        if (!Array.isArray(answer)) return false;
        const correct = question.correctAnswerIndices ?? [];
        return answer.length === correct.length && answer.every((i) => correct.includes(i));
      }
      return answer === question.correctAnswerIndex;

    case 'true false':
      return answer === question.correctAnswer;

    case 'open ended':
      return true;

    default:
      return false;
  }
}


export function computeQuizScore(
  questionAnswers: QuestionAttemptType[],
  passingScorePercent: number
): { score: number; passed: boolean; correctCount: number; totalCount: number } {
  const totalCount = questionAnswers.length;
  if (totalCount === 0) {
    return { score: 0, passed: false, correctCount: 0, totalCount: 0 };
  }
  const correctCount = questionAnswers.filter((a) => isAnswerCorrect(a.question, a.answer)).length;
  const score = Math.round((correctCount / totalCount) * 100);
  const passed = score >= passingScorePercent;
  return { score, passed, correctCount, totalCount };
}


export function serializeQuestionAnswersForFirebase(questionAnswers: QuestionAttemptType[]): StoredQuestionAnswer[] {
  return questionAnswers.map((a) => ({
    questionId: a.question.id,
    answer: a.answer,
  }));
}

export function hydrateQuestionAnswers(
  stored: StoredQuestionAnswer[] | undefined,
  questions: QuizQuestionType[] | undefined
): QuestionAttemptType[] {
  if (!stored?.length || !questions?.length) return [];
  return stored
    .map((qa) => {
      const question = questions.find((q) => q.id === qa.questionId);
      return question ? ({ question, answer: qa.answer } as QuestionAttemptType) : null;
    })
    .filter((a): a is QuestionAttemptType => a != null);
}
