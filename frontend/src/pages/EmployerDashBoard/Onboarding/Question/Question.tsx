import './Question.css';
import { Slider } from "@radix-ui/themes";
import { useState } from 'react';
import { useRef } from "react";
import default_icon from '../../../../assets/icons/default-icon.svg';
import icon_stroke from '../../../../assets/icons/icon-stroke.svg';
import add_cta from '../../../../assets/icons/add-cta.svg';

type QuestionProps = {
    question: string;
    input_type: "text" | "email" | "checkbox" | "radio" | "range" | "select" | "file" | "image";
    value?: any;
    onChange?: (value: any) => void;
    options?: string[];
    direction?: string;
    placeholder?: string;
    meta?: "pfp" | "none";
};

export default function Question({ question, input_type, value, onChange, options=[], direction, placeholder, meta }: QuestionProps) {
    const [range, setRange] = useState<[number, number]>([0, 50]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

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
                        <label className="checkbox-option">
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
                            <span className="checkbox-box">
                                <svg
                                    className="check-icon"
                                    width="12"
                                    height="10"
                                    viewBox="0 0 12 10"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    >
                                    <path
                                        d="M11.293 1.40039L4 8.69336L0.707031 5.40039L1.40039 4.70703L4 7.30664L10.5996 0.707031L11.293 1.40039Z"
                                        fill="white"
                                        stroke="white"
                                    />
                                </svg>
                            </span>
                            <span className="checkbox-label">{opt}</span>   
                        </label>
                )));

                case "file":
                    return (
                        (meta === "pfp") ? 
                        ((value) ? (<div className="pfp-upload-container">
                            <img src={value} className="uploaded-image"/>
                            <img src={icon_stroke} className="img-frame"/>
                            <img src={add_cta} className="pfp-add" onClick={() => fileInputRef.current?.click()}/>
                            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => onChange?.(e.target.files?.[0])}/>
                        </div>) :
                        (<div className="pfp-upload">
                            <img src={default_icon} className="pfp-base"/>
                            <img src={add_cta} className="pfp-add" onClick={() => fileInputRef.current?.click()}/>
                            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => onChange?.(e.target.files?.[0])}/>
                        </div>)) :
                        (<input type="file" accept="image/*" onChange={(e) => onChange?.(e.target.files?.[0])}/> )
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