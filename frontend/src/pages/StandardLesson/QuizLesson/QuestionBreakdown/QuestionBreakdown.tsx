import './QuestionBreakdown.css';
import { useState } from 'react';
import type { QuestionAttemptType } from '../../../../types/Standard/QuizQuestion/QuestionTypes';
import green_check from '../../../../assets/icons/quiz/green-checkplus-icon.svg';
import red_x from '../../../../assets/icons/quiz/red-x-circle-icon.svg';
import chevron_down from '../../../../assets/icons/black-down-chevron.svg';
import ai_icon from '../../../../assets/icons/simulations/black-ai-icon.svg';
import Check from '../../../../assets/icons/green-check.svg';
import X from '../../../../assets/icons/red-x.svg';

export default function QuestionBreakdown({ idx, questionAttempt }: { idx: number, questionAttempt: QuestionAttemptType}) {
    const [expanded, setExpanded] = useState(false);
    const { question, answer, aiEvaluation } = questionAttempt;
    const questionType = question.type;
    const correct = (() => {
        switch (question.type) {
            case "mcq":
                if (question.allowMultiple) {
                    if (!Array.isArray(answer)) return false;
                    const correct = question.correctAnswerIndices ?? [];
                    return (
                        answer.length === correct.length &&
                        answer.every(i => correct.includes(i))
                    );
                }
                return answer === question.correctAnswerIndex;


            case "true false":
            return answer === question.correctAnswer;

            case "open ended":
            return (aiEvaluation?.score ?? 0) >= 7;;

            default:
            return false;
        }
    })();

    const renderCorrectChoice = () => {
        switch (questionType) {
            case "mcq":
                if (question.allowMultiple) {
                    return (question.correctAnswerIndices?.map((i) => <Choice text={question.options![i]} isCorrect={true} /> ));
                }
                return <Choice text={question.options![question?.correctAnswerIndex ?? 0]} isCorrect={true} />;
            case "true false":
                return <Choice text={question.correctAnswer ? "True" : "False"} isCorrect={true} />;
            case "open ended":
                return (
                    <div className="choice-breakdown-item">
                        {answer}
                    </div>
                );
        }
    };

    const renderIncorrectChoice = () => {
        switch(questionType) {
            case "mcq":
                if (question.allowMultiple) {
                    if (!question.allowMultiple) return null;
                    if (!Array.isArray(answer)) return null;
                    return (answer?.map((i) => <Choice text={question.options![i]} isCorrect={false} /> ));
                }
                if (typeof answer === "number") {
                    return (<Choice text={question.options?.[answer] ?? ""} isCorrect={false} />);
                
                }  
                return null;
            case "true false":
                return <Choice text={answer ? "True" : "False"} isCorrect={false} />
        }
    };

    return (
        <div className={`question-breakdown-item ${correct ? "correct": "incorrect"}`}>
            <div className="question-breakdown-item-top">
                <div className="question-breakdown-item-top-right">
                    <span>
                        <div className={`${correct ? "strengths-check" : "wrong-x"} quiz`}>
                            <img src={correct ? Check : X} />
                        </div>
                    </span>
                    Question { idx }
                </div>
                <img className={`expand-chevron ${expanded ? "up": ""}`} src={chevron_down} onClick={() => setExpanded(prev => !prev)}/>
            </div>
            { (expanded) &&
                <div className="question-breakdown-item-bottom">
                    {question.prompt}
                    <div className="choice-breakdown">
                        <div className="answers-wrapper">
                            <p>{questionType !== "open ended" ? "Correct" : "Your" } Answer:</p>
                            <div className="correct-choices">
                                {renderCorrectChoice()}
                            </div>
                        </div>    
                        {(!correct && questionType !== "open ended") &&
                            <div className="answers-wrapper">
                                <p>Your Answer:</p>
                                {renderIncorrectChoice()}
                            </div>
                        }
                        {questionType === "open ended" && aiEvaluation && (
                            <div className="ai-feedback">
                                <strong>
                                    <span>
                                        <img src={ai_icon} />
                                    </span>
                                    AI Feedback
                                </strong> 
                                <p>{aiEvaluation.feedback}</p>
                            </div>
                        )}
                    </div>
                </div>
            }
        </div>
    );
}


function Choice({ isCorrect, text }: { isCorrect: boolean, text: string }) {
    return (
        <div className={`choice-breakdown-item ${isCorrect ? "correct" : "incorrect"}`}>
            {text}
        </div>
    );
}