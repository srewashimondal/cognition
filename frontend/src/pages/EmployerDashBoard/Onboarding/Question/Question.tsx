import './Question.css';
import { Slider, CheckboxGroup, Select, Switch } from "@radix-ui/themes";
import { useState, useRef } from 'react';
import FileItem from '../../../../components/FileItem/FileItem';
import default_icon from '../../../../assets/icons/default-icon.svg';
import icon_stroke from '../../../../assets/icons/icon-stroke.svg';
import add_cta from '../../../../assets/icons/add-cta.svg';
import upload_icon from '../../../../assets/icons/upload-icon.svg';

type QuestionProps = {
    question: string;
    input_type: "text" | "email" | "checkbox" | "radio" | "range" | "select" | "file" | "image" | "image-buttons" | "switch";
    value?: any;
    onChange?: (value: any) => void;
    options?: string[];
    fileOptions?: string[];
    direction?: string;
    placeholder?: string;
    meta?: "pfp" | "pdf" | "map"; /* include video types later */
    required?: boolean;
};

export default function Question({ question, input_type, value, onChange, options=[], fileOptions=[], direction, placeholder, meta, required }: QuestionProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [dragging, setDragging] = useState(false);

    const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/svg+xml",
    ];

    function renderInput() {
        switch (input_type) {
            case "text":
                return(
                    <input type="text" required={required} placeholder={placeholder} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)}/>
                );

            case "email":
                return(
                    <input type="email" required={required} placeholder={placeholder} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)}/>
                );

            case "range":
                return(
                    <div className="range-div">
                        <Slider className="range-slider"
                            defaultValue={[0, 100]} value={value as [number, number]} onValueChange={(val) => onChange?.(val as [number, number])}
                            min={0} max={100} variant="soft" color="orange" 
                        />
                        <div className="range-text-div">
                            <span className="range-text num">{value[0]} - {value[1]}</span>
                            <span className="range-text">people</span>
                        </div>
                    </div>
                );

            case "select":
                return (
                    /*<div className="select-root">
                        <button type="button" onClick={() => (setOpen(!open))}>
                            <span className="select-label">{value}</span>
                            <span className="select-chevron">
                                <img src={chevron_down}/>
                            </span>
                        </button>
                        {open && (
                            <ul className="select-content">
                                {options.map(opt => (
                                    <li key={opt} className={`select-item ${(value === opt) ? "selected" : ""}`}
                                    onClick={() => {onChange?.(opt);
                                    setOpen(false);}}>
                                        <span className="checked-icon">
                                            {(value === opt) ? (<div className="check-swap">
                                                                    <img className="check default" src={orange_check} /> 
                                                                    <img className="check hover" src={checkmark} />
                                                                </div> ) : (<img className="check-thing" src={checkmark} />)}
                                        </span>
                                        <span className="item-text">{opt}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>*/
                    <Select.Root defaultValue={value} value={value} onValueChange={(v) => {onChange?.(v)}}>
                        <Select.Trigger />
                        <Select.Content color="orange">
                            {options.map(o => 
                                <Select.Item key={o} value={o}>{o}</Select.Item>
                            )}
                        </Select.Content>
                    </Select.Root>
                );

            case "radio":
                return (
                    options.map((opt) => (
                    <label className="radio-opt" key={opt}>
                        <input type="radio" required={required} name={question} checked={value === opt} onChange={() => onChange?.(opt)} />
                        <p>{opt}</p>
                    </label>
                )));
            
            case "checkbox":
                return (
                    <CheckboxGroup.Root
                      value={value ?? []}
                      onValueChange={(vals) => onChange?.(vals)}
                      className="checkbox-group"
                      size="3"
                      color="orange"
                    >
                      {options.map((opt) => (
                        <CheckboxGroup.Item
                          key={opt}
                          value={opt}
                          className="checkbox-item"
                        >
                          {opt}
                        </CheckboxGroup.Item>
                      ))}
                    </CheckboxGroup.Root>
                  );

                case "switch": 
                  return (
                    <div className="switch-item">
                      <Switch checked={value} onCheckedChange={v => onChange?.(v)} className="checkbox-item" color="cyan" />
                          {placeholder}
                    </div>
                  );

                case "file":
                    switch (meta) {
                        case "pfp": 
                            return ((value) ? (<div className="pfp-upload-container">
                                <img src={value} className="uploaded-image"/>
                                <img src={icon_stroke} className="img-frame"/>
                                <img src={add_cta} className="pfp-add" onClick={() => fileInputRef.current?.click()}/>
                                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => onChange?.(e.target.files?.[0])}/>
                            </div>) :
                            (<div className="pfp-upload">
                                <img src={default_icon} className="pfp-base"/>
                                <img src={add_cta} className="pfp-add" onClick={() => fileInputRef.current?.click()}/>
                                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => onChange?.(e.target.files?.[0])}/>
                            </div>)) 
                        case "pdf":
                            return (<div className={`upload-div ${(dragging) ? "dragging" : ""}`} onClick={() => fileInputRef.current?.click()}
                                      onDragOver={(e) => {e.preventDefault(); setDragging(true);}} 
                                      onDragLeave={() => setDragging(false)}
                                      onDrop={(e) => {e.preventDefault(); setDragging(false);
                                        const files = Array.from(e.dataTransfer.files).filter(
                                            (file) => file.type ==="application/pdf"
                                        )
                                        onChange?.([...(value ?? []), ...files]);
                                      }} >

                                        <div className="uploaded-content-div">
                                            {Array.isArray(value) && (
                                                <ul className="file-list">
                                                    {value.map((file: File) => (
                                                        <FileItem key={file.name} file={file} />
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        <div className="dropzone">
                                            <input ref={fileInputRef} type="file" accept="application/pdf"
                                            multiple hidden onChange={(e) => {const files = Array.from(e.target.files || []); onChange?.([...(value ?? []), ...files])}} /> 
                                            <img src={upload_icon}/>
                                            <p>
                                                <strong>Drag and drop files</strong>
                                            </p>
                                            <span>OR</span>
                                            <button type="button" 
                                            onClick={(e) => {e.stopPropagation(); fileInputRef.current?.click(); }}>Browse Files</button>
                                        </div>
                                    </div>);

                        case "map":
                            return (
                            <div className={`upload-div ${dragging ? "dragging" : ""}`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => {e.preventDefault(); setDragging(true);}}
                                onDragLeave={() => setDragging(false)}
                                onDrop={(e) => {e.preventDefault(); setDragging(false);
                        
                                const files = Array.from(e.dataTransfer.files).filter(
                                    (file) => allowedTypes.includes(file.type)
                                );
                        
                                onChange?.(files[0] ?? null); }}
                            >
                                <div className="uploaded-content-div">
                                    {value && (
                                        <ul className="file-list">
                                            <FileItem key={value.name} file={value} />
                                        </ul>
                                    )}
                                </div>
                        
                                <div className="dropzone">
                                    <input ref={fileInputRef} type="file" accept="application/pdf, image/jpeg,image/png,image/svg+xml" hidden
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []).filter(
                                            (file) => allowedTypes.includes(file.type)
                                        );
                            
                                        onChange?.(files[0] ?? null);
                                        }}
                                    />
                        
                                    <img src={upload_icon} />
                                    <p>
                                        <strong>Drag and drop map file</strong>
                                    </p>
                                    <span>OR</span>
                                    <button type="button"
                                        onClick={(e) => {e.stopPropagation(); fileInputRef.current?.click();}}
                                    >Browse Files</button>
                                </div>
                            </div>
                            );
  

                        default:
                            return (<input type="file" accept="image/*" onChange={(e) => onChange?.(e.target.files?.[0])}/> )
                    };

                case "image-buttons":
                    return fileOptions.map((opt, index) => (
                            <div key={options[index]} className={`image-button ${(value === options[index]) ? "selected" : ""}`} onClick={() => (onChange?.(options[index]))}>
                                <img src={opt} />
                            </div>
                    ));

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