import './Question.css';
import { Slider } from "@radix-ui/themes";
import { useState } from 'react';

type QuestionProps = {
    question: string;
    input_type: "text" | "email" | "checkbox" | "radio" | "range" | "select" | "file" | "image";
    value?: any;
    onChange?: (value: any) => void;
    options?: string[];
    direction?: string;
    placeholder?: string;
};

export default function Question({ question, input_type, value, onChange, options=[], direction, placeholder }: QuestionProps) {
    const [range, setRange] = useState<[number, number]>([0, 50]);

    function renderInput() {
        switch (input_type) {
            case "text":
                return(
                    <input type="text" placeholder={placeholder} value={value || ""} onChange={(e) => onChange?.(e.target.value)}/>
                );

            case "email":
                return(
                    <input type="email" placeholder={placeholder} value={value || ""} onChange={(e) => onChange?.(e.target.value)}/>
                );

            case "range":
                return(
                    <Slider
                        defaultValue={[0, 100]} value={range} onValueChange={(val) => setRange(val as [number, number])}
                        min={0} max={100} variant="soft"
                    />
                );

            case "select":
                return (
                    <select value={value} onChange={(e) => onChange?.(e.target.value)}>
                        {options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );

            case "radio":
                return (
                    options.map((opt) => (
                    <label key={opt}>
                        <input type="radio" name={question} checked={value === opt} onChange={() => onChange?.(opt)} />
                        {opt}
                    </label>
                )));
            
            case "checkbox":
                return (
                    options.map((opt) => (
                        <label key={opt}>
                            <input type="checkbox" checked={value?.includes(opt)}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    onChange?.(
                                        checked ?
                                        [...(value || []), opt]
                                        : value.filter((v: string) => v !== opt)
                                    );
                                }}
                            />
                            {opt}
                        </label>
                )));

                case "file":
                    return (
                        <input type="file" onChange={(e) => onChange?.(e.target.files?.[0])}/>
                    );

                default:
                    return null;
        }
    }
    
    return (
        <div className="question-wrapper">
            <h3 className="question-text">{question}</h3>
            {(direction) && <p className="direction-text">{direction}</p>}
            <div className={`input-wrapper type-${input_type}`}>
                {renderInput()}
            </div>
        </div>
    );
}