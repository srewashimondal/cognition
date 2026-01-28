import './QuestionCard.css';
import { useRef, useState, useEffect } from 'react';
import ChoiceItem from './ChoiceItem/ChoiceItem';
import type { QuizQuestionType } from '../../types/Standard/QuizQuestion/QuestionTypes';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Select, Separator, Switch } from "@radix-ui/themes";
import drag_icon from '../../assets/icons/grey-drag-icon.svg';
import trash_icon from '../../assets/icons/simulations/grey-trash-icon.svg';
import mic_icon from '../../assets/icons/quiz-question/black-mic-icon.svg';
import img_icon from '../../assets/icons/quiz-question/black-image-icon.svg';
import plus_icon from '../../assets/icons/simulations/black-plus-icon.svg';
import white_check from '../../assets/icons/white-check.svg';
import x_icon from '../../assets/icons/simulations/grey-x-icon.svg';

type QuestionCardProps = {
    question: QuizQuestionType;
    handleDelete: () => void;
    position: number;
    onUpdate: (id: number, updates: Partial<QuizQuestionType>) => void;
};

export default function QuestionCard({ question, handleDelete, position, onUpdate }: QuestionCardProps) {
    const id = question.id;
    const type = question.type;

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    useEffect(() => {
        if (!question.image) {
            setImagePreview(null);
            return;
        }
        const url = typeof question.image === "string" ? question.image : URL.createObjectURL(question.image);
        setImagePreview(url);

        return () => URL.revokeObjectURL(url);
    }, [question.image]);

    const handleTypeChange = (newType: QuizQuestionType["type"]) => {
        switch (newType) {
            case "mcq":
                onUpdate(id, {
                type: "mcq",
                prompt: "",
                options: ["", ""],
                correctAnswerIndex: 0,
            });
            break;
        
            case "true false":
                onUpdate(id, {
                type: "true false",
                prompt: "",
                correctAnswer: true,
            });
            break;
        
            case "open ended":
                onUpdate(id, {
                type: "open ended",
                prompt: "",
            });
            break;
        }
    };

    const handleAddChoice = () => {
        if (question.type !== "mcq") return;
        const options = question.options;
        onUpdate(question.id, {
          options: [...(options ?? []), ""],
        });
    };
      
    const handleChoiceUpdate = (index: number, value: string) => {
        if (question.type !== "mcq") return;
        const options = question.options;
        const newOptions = [...(options ?? [])];
        newOptions[index] = value;
        onUpdate(question.id, { options: newOptions });
    };

    const handleDeleteChoice = (index: number) => {
        if (question.type !== "mcq") return;
        const options = question.options;
        onUpdate(question.id, {options: (options ?? []).filter((_, i) => i !== index),});
    };

    const handleSelect = (index: number) => {
        if (question.type !== "mcq") return;
      
        if (question.allowMultiple) {
            const prev = question.correctAnswerIndices ?? [];
        
            const next = prev.includes(id)
                ? prev.filter(i => i !== index)
                : [...prev, index];
        
            onUpdate(question.id, {
                correctAnswerIndices: next,
            });
            return;
        }
        
        onUpdate(question.id, {correctAnswerIndex: index});
    };

    const handleToggleAllowMultiple = (checked: boolean) => {
        if (question.type !== "mcq") return;
      
        if (checked) {
            onUpdate(question.id, {
                allowMultiple: true,
                correctAnswerIndices: [],
                correctAnswerIndex: undefined,
            });
        } else {
                onUpdate(question.id, {
                allowMultiple: false,
                correctAnswerIndex: undefined,
                correctAnswerIndices: undefined,
            });
        }
    };

    const handleTrueFalseChange = (correctAnswer: boolean) => {
        if (question.type !== "true false") return;
        onUpdate(question.id, {correctAnswer: correctAnswer});
    };
      
    return (
        <div className="question-card-wrapper" ref={setNodeRef} style={style}>
            <div className="drag-handle question" {...listeners} {...attributes}>
                <img src={drag_icon} />
            </div>
            <div className="question-card">
                <div className="question-card-header">
                    <Select.Root defaultValue={type} value={type} 
                    onValueChange={(value) => handleTypeChange(value as QuizQuestionType["type"])}>
                        <Select.Trigger />
                        <Select.Content color="orange">
                            <Select.Item value="mcq">Multiple Choice</Select.Item>
                            <Select.Item value="true false">True or False</Select.Item>
                            <Select.Item value="open ended">Open Ended</Select.Item>
                        </Select.Content>
                    </Select.Root>
                    <div className="local-action-panel">
                        <div className="builder-action" onClick={handleDelete}>
                            <img src={trash_icon} />
                        </div>
                    </div>
                </div>
                <div className="question-card-content">
                    <div className="question-card-number">
                        Question {position}
                        <div className="question-card-prompt-row">
                            <div className="question-card-prompt-item" onClick={() => fileInputRef.current?.click()}>
                                <img src={img_icon} />
                                <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={(e) => onUpdate(id, {image: e.target.files?.[0]})} />
                            </div>
                            <div className="question-card-prompt-item">
                                <img src={mic_icon} />
                            </div>
                        </div>
                    </div>
                    <div className={`question-card-prompt ${(type === "open ended" ? "expanded" : "")}`}>
                        { (question.image) &&
                            <div className="img-section">
                                <div className="upload-wrapper">
                                    <div className="uploaded-img">
                                        <img src={imagePreview ?? ""} />
                                    </div>
                                    <div className="image-x" onClick={() => {setImagePreview(null); onUpdate(id, { image: null }); }}>
                                        <img src={x_icon} />
                                    </div>
                                </div>
                            </div>
                        }
                        <textarea placeholder="Enter question prompt" value={question.prompt ?? ""} 
                        onChange={(e) => onUpdate(question.id, { prompt: e.target.value })} />
                    </div>
                    { (type === "mcq") &&
                        <div className="question-card-choices-wrapper">
                            <div className="choice-settings">
                                <p>Choices</p>
                                <Separator orientation="vertical" />
                                <div className="switch-item">
                                    <Switch color="cyan" size="1" checked={question.allowMultiple ?? false} 
                                    onCheckedChange={handleToggleAllowMultiple} />
                                    <span>Allow Multiple Answers</span>
                                </div>
                            </div>
                            <div className="choices-list">
                                {
                                    question.options?.map((o, i) => <ChoiceItem key={i} content={o} id={i} 
                                    isCorrect={question.allowMultiple ? question.correctAnswerIndices?.includes(i) ?? false : question.correctAnswerIndex === i} 
                                    onUpdate={handleChoiceUpdate} onSelect={handleSelect} onDelete={handleDeleteChoice} />)
                                }
                            </div>
                            <div className="add-choice">
                                <button className="add-choice-btn" onClick={handleAddChoice}>
                                    <span className="add-choice-icon">
                                        <img src={plus_icon} />
                                        Add choice
                                    </span>
                                </button>
                            </div>
                        </div>
                    }
                    { (type === "true false") &&
                    <div className="choices-list tf">
                        <div className="choice-item tf">
                            <div className={`check-choice tf ${question.correctAnswer ? "selected" : ""}`} onClick={() => handleTrueFalseChange(true)}>
                                <img src={white_check} />
                            </div>
                            True
                        </div>
                        <div className="choice-item tf">
                            <div className={`check-choice tf ${!question.correctAnswer ? "selected" : ""}`} onClick={() => handleTrueFalseChange(false)}>
                                <img src={white_check} />
                            </div>
                            False
                        </div>
                    </div>
                    }
                </div>
            </div>
        </div>
    );
}