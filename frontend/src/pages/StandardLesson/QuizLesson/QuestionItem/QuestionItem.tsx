import './QuestionItem.css';
import type { QuizQuestionType } from '../../../../types/Standard/QuizQuestion/QuestionTypes';

type QuestionItemProps = {
    idx: number;
    question: QuizQuestionType | undefined;
    answer?: number | boolean | string;
    onAnswer: (question: QuizQuestionType, answer: any) => void;
};

export default function QuestionItem({ idx, question, answer, onAnswer }: QuestionItemProps) {
    const questionType = question?.type;

    function renderChoices() {
        if (!question) return null;

        switch(questionType) {
            case "mcq":
                const isMulti = question?.allowMultiple ?? false;
                const selected: number | number[] | null = typeof answer === "number" || Array.isArray(answer) ? answer : isMulti ? [] : null;
                return (
                    <>
                        {question?.options?.map((c, i) => {
                            const isSelected = isMulti ? Array.isArray(selected) && selected.includes(i) : selected === i;
                            return (
                                <Choice key={i} text={c} selected={isSelected} 
                                    onClick={() => {
                                        if (isMulti) {
                                            const arr = Array.isArray(selected) ? selected : [];
                                            const next = arr.includes(i) ? arr.filter(x => x !== i) : [...arr, i];
                                            onAnswer(question, next);
                                        } else {
                                            onAnswer(question, i);
                                        }
                                    }}
                                />
                            );
                        })}
                    </>
                );
            
            case "true false":
                const isSelected: boolean | null = typeof answer === "boolean" ? answer : null;;
                return (
                    <>
                        <Choice key={1} text={"True"} selected={isSelected === true} onClick={() => onAnswer(question, true)} />
                        <Choice key={2} text={"False"} selected={isSelected === false} onClick={() => onAnswer(question, false)} />
                    </>
                );

            case "open ended":
                const value = typeof answer === "string" ? answer : "";
                return (
                    <>
                        <textarea placeholder="Provide an answer" value={value} 
                        onChange={(e) => onAnswer(question, e.target.value)}/>
                    </>
                );
        }
    };

    return (
        <div className="question-item">
            <div className="question-prompt-wrapper">
                <p className="question-num">Question {idx}</p>
                <p className="question-prompt">{question?.prompt}</p>
            </div>
            <div className={`question-answers ${questionType}`}>
                {renderChoices()}
            </div>
        </div>
    );
}

function Choice({ text, selected, onClick }: { text: string, selected: boolean | null, onClick: () => void}) {
    return (
        <div className={`choice ${selected ? "selected" : ""}`} onClick={onClick}>
            {text}
        </div>
    );
}