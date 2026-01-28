import './QuizLessonPage.css';
import { useState, useEffect } from 'react';
import type { QuizLessonType } from '../../../types/Standard/StandardLessons';
import type { StandardLessonAttempt } from '../../../types/Standard/StandardAttempt';
import type { QuizQuestionType } from '../../../types/Standard/QuizQuestion/QuestionTypes';
import type { QuestionAttemptType } from '../../../types/Standard/QuizQuestion/QuestionTypes';
import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import QuestionItem from './QuestionItem/QuestionItem';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage';
import ActionButton from '../../../components/ActionButton/ActionButton';
import QuestionBreakdown from './QuestionBreakdown/QuestionBreakdown';
import left_arrow from '../../../assets/icons/orange-left-arrow.svg';
import quiz_icon from '../../../assets/icons/quiz/orange-quiz-icon.svg';
import list_icon from '../../../assets/icons/black-list-icon.svg';
import clock_icon from '../../../assets/icons/simulations/black-clock-icon.svg';
import check_icon from '../../../assets/icons/quiz/black-checkplus-icon.svg';
import warning_icon from '../../../assets/icons/quiz/black-circle-warning.svg';
import white_play_icon from '../../../assets/icons/actions/white-play-icon.svg';
import blue_play_icon from '../../../assets/icons/quiz/blue-play-icon.svg';
import timer_icon from '../../../assets/icons/quiz/blue-timer-icon.svg';

type QuizLessonPageProps = {
    lessonAttempt: StandardLessonAttempt;
    handleBack: () => void;
    moduleTitle: string;
};

type Status = "not begun" | "started" | "completed" | "locked";

export default function QuizLessonPage({ lessonAttempt, handleBack, moduleTitle }: QuizLessonPageProps) {
    const [currentStatus, setCurrentStatus] = useState<Status>(lessonAttempt.status);
    const lesson = lessonAttempt.lessonInfo.type === "quiz" ? lessonAttempt.lessonInfo : null;

    switch (currentStatus) {
        case "not begun":
            return (
                <div className="quiz-begin-page">
                    <div className="back-to-lessons-wrapper">
                        <div className="back-to-lessons" onClick={handleBack}>
                            <img src={left_arrow} />
                        </div>
                    </div>
                    <QuizBegin lesson={lesson} onClick={() => setCurrentStatus("started")}/>
                </div>
            );
        
        case "started":
            return <QuizPage lesson={lesson} moduleTitle={moduleTitle} onClick={() => setCurrentStatus("completed")} />;

        case "completed":
            return <QuizComplete lesson={lesson} onClick={() => setCurrentStatus("not begun")} handleBack={handleBack} />;
    }
}

function QuizBegin({ lesson, onClick }: { lesson: QuizLessonType | null, onClick: () => void }) {
    return (
        <div className="quiz-begin-card">
            <div className="quiz-icon-big">
                <img src={quiz_icon} />
            </div>
            <h1 className="quiz-title">
                {lesson?.title}
            </h1>
            <div className="quiz-begin-meta">
                <div className="quiz-begin-meta-row">
                    <div className="quiz-begin-meta-item">
                        <span>
                            <img src={list_icon} />
                        </span>
                        {lesson?.questions?.length} questions
                    </div>
                    <div className="quiz-begin-meta-item">
                        <span>
                            <img src={clock_icon} />
                        </span>
                        {lesson?.duration} minutes
                    </div>
                </div>
                <div className="quiz-begin-meta-row">
                    <div className="quiz-begin-meta-item">
                        <span>
                            <img src={check_icon} />
                        </span>
                        {lesson?.passingScore}% benchmark
                    </div>
                    <div className="quiz-begin-meta-item">
                        <span>
                            <img src={warning_icon} />
                        </span>
                        {3} retakes left
                    </div>
                </div>
            </div>
            <div className="quiz-instructions">
                <p>1. You must complete all questions without 10 minutes</p>
                <p>2. You cannot exit the quiz once you have begun</p>
                <p>3. Your quiz will auto-submit when time runs out</p>
            </div>
            <div className="begin-quiz-btn-wrapper">
                <button className="begin-quiz-btn" onClick={onClick}>
                    <div className="play-swap">
                        <img className="play-icon default" src={white_play_icon} />
                        <img className="play-icon hover" src={blue_play_icon} />
                    </div>
                    Begin Quiz
                </button>
            </div>
        </div>
    );
}

function QuizPage({ lesson, moduleTitle, onClick }: { lesson: QuizLessonType | null, moduleTitle: string, onClick: () => void }) {
    const questions = lesson?.questions;
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
    const [pendingSubmit, setPendingSubmit] = useState(false);
    const [questionAnswers, setQuestionAnswers] = useState<QuestionAttemptType[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleBack = () => {
        setCurrentQuestionIdx(i => i - 1);
    };

    const handleNext = () => {
        setCurrentQuestionIdx(i => i + 1);
    };

    const handleSubmit = () => {
        setPendingSubmit(true);
    }

    useEffect(() => {
        if (!pendingSubmit) return;
        if (!questions) {
            setPendingSubmit(false);
            return;
        }
        
        if (questionAnswers.length !== questions.length) {
            setError("You must complete all questions to submit.");
            setPendingSubmit(false);
            return;
        }

        setError(null);

        const t = setTimeout(() => {
            onClick();
            setPendingSubmit(false);
        }, 100);

        return () => clearTimeout(t);
    }, [pendingSubmit, questionAnswers.length, questions?.length]);

    const total = questions?.length ?? 1;
    const percent = pendingSubmit ? 100 : Math.floor(((questionAnswers.length) / total) * 100);

    const recordAnswer = (question: QuizQuestionType, answer: number | boolean | string) => {
        setQuestionAnswers(prev => {
            const existing = prev.find(a => a.question.id === question.id);
      
            if (existing) {
                return prev.map((a) => a.question.id === question.id ? { ...a, answer } : a);
            }
      
            return [...prev, { question, answer }];
        });
    };

    const duration = lesson?.duration;
    const timeLeft = useCountdown(typeof duration === "number" ? duration * 60 : null);
    const minutes = typeof timeLeft === "number" ? Math.floor(timeLeft / 60) : null;
    const seconds = typeof timeLeft === "number" ? timeLeft % 60 : null;

    useEffect(() => {
        if (timeLeft === 0) {
            onClick();
        }
    }, [timeLeft]);
   
    return (
        <div className="quiz-page">
            <div className="quiz-page-header">
                <div className="quiz-page-title">
                    <p className="quiz-title">{lesson?.title}</p>
                    <p className="module-title">{moduleTitle}</p>
                </div>
                <div className="quiz-progress-wrapper">
                    <ProgressBar percent={percent} style={true} style1={true} />
                </div>
                <div className="quiz-timer">
                    <span>
                        <img src={timer_icon} />
                    </span>
                    <div className="quiz-time">
                        <p className="time-left">
                            {minutes}:{seconds!.toString().padStart(2, "0")}
                        </p>
                        <p className="time-left-label">Time Left</p>
                    </div>
                </div>
            </div>
            <div className="question-wrapper">
                <QuestionItem idx={currentQuestionIdx + 1} question={questions?.[currentQuestionIdx]} 
                answer={questionAnswers.find(a => a.question.id === questions?.[currentQuestionIdx]?.id)?.answer}
                onAnswer={recordAnswer}/>
                {error && <ErrorMessage message={error} />}
            </div>
            <div className="quiz-page-footer">
                <div className="question-navigate-wrapper">
                    { (currentQuestionIdx !== 0) &&
                        <button className="question-navigate" onClick={handleBack}>
                            <div className="question-navigate-icon">
                                <img src={left_arrow} />
                            </div>
                            Previous
                        </button>
                    }
                    { (currentQuestionIdx !== ((questions?.length ?? 1) - 1)) ?
                        <button className="question-navigate next" onClick={handleNext}>
                            Next
                            <div className="question-navigate-icon">
                                <img className="next-arrow" src={left_arrow} />
                            </div>
                        </button> :
                        <div className="filler" />
                    }
                </div>
                { (currentQuestionIdx === ((questions?.length ?? 1) - 1)) && 
                    <button className="finish-btn" onClick={handleSubmit}>
                        Submit
                    </button>
                }
            </div>
        </div>
    );
}


function QuizComplete({ lesson, onClick, handleBack }: { lesson: QuizLessonType | null, onClick: () => void, handleBack: () => void }) {
    const [fill, setFill] = useState(0);
    const questions = lesson?.questions;
    // temp data
    const questionAnswers: QuestionAttemptType[] = [
        {
            question: questions![0],
            answer: 2
        },
        {
            question: questions![1],
            answer: false
        },
        {
            question: questions![2],
            answer: "Lorem ipsum"
        }
    ];

    useEffect(() => {
        setFill(0);
        const t = setTimeout(() => {setFill(60);}, 100);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="quiz-complete-page">
            <div className="quiz-complete-title">
                {lesson?.title}
            </div>
            <div className="quiz-score">
                <p>Score for this Attempt</p>
                <h1>60%</h1>
            </div>
            <div className="quiz-bar">
                <div className="bar-wrapper">
                    <div
                        className="bar-fill"
                        style={{ width: `${fill}%` }}
                    />
                </div>
                <h2>Pass</h2>
                <p>Passing benchmark: {lesson?.passingScore}%</p>
            </div>
            <div className="quiz-complete-actions">
                <ActionButton text={"Retake Quiz"} buttonType={"play"} onClick={onClick} />
                <ActionButton text={"Back to Module"} buttonType={"go"} onClick={handleBack} />
            </div>
            <div className="question-breakdown">
                <div className="question-breakdown-header">
                    <p>Question Breakdown</p>
                    <p className="right-text">2/3 Correct</p>
                </div>
                { (questionAnswers.map((a, i) =>  <QuestionBreakdown questionAttempt={a} idx={i + 1}/>))}
            </div>
        </div>
    );
}

function useCountdown(initialSeconds: number | null) {
    const [timeLeft, setTimeLeft] = useState<number | null>(initialSeconds);
  
    useEffect(() => {
        if (initialSeconds == null) return;

        setTimeLeft(initialSeconds);
  
        const interval = setInterval(() => {
        setTimeLeft(prev => {
            if (prev == null || prev <= 1) {
            clearInterval(interval);
            return 0;
            }
            return prev - 1;
        });
        }, 1000);
  
        return () => clearInterval(interval);
    }, [initialSeconds]);
  
    return timeLeft;
}