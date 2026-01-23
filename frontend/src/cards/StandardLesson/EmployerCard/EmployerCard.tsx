import './EmployerCard.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadDropzone from '../../../components/UploadDropzone/UploadDropzone';
import ActionButton from '../../../components/ActionButton/ActionButton';
import { RadioGroup, Switch } from "@radix-ui/themes";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import trash_icon from '../../../assets/icons/simulations/grey-trash-icon.svg';
import movie_icon from '../../../assets/icons/simulations/grey-movie-icon.svg';
import quiz_icon from '../../../assets/icons/simulations/grey-quiz-icon.svg';
import slider_icon from '../../../assets/icons/simulations/black-slider-icon.svg';
import down_chevron from '../../../assets/icons/simulations/grey-down-chevron.svg';
import up_chevron from '../../../assets/icons/simulations/grey-up-chevron.svg';
import drag_icon from '../../../assets/icons/grey-drag-icon.svg';
import right_arrow_icon from '../../../assets/icons/simulations/grey-right-arrow.svg';

type EmployerCardProps = {
    id: number;
    title: string;
    type: "video" | "quiz";
    handleDelete: () => void;
    position: number;
};

export default function EmployerCard({ id, title, type, handleDelete, position }: EmployerCardProps) {
    const navigate = useNavigate();
    const [titleState, setTitleState] = useState(title);
    const [videoFiles, setVideoFiles] = useState<File[]>([]);
    const [allowTranscript, setAllowTranscript] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [attemptMode, setAttemptMode] = useState<"unlimited" | "custom">("unlimited");
    const [customNumAttempts, setCustomNumAttempts] = useState<number | "">("");
    const [timeLimitMode, setTimeLimitMode] = useState<"unlimited" | "custom">("unlimited");
    const [timeLimitMin, setTimeLimitMin] = useState<number | "">("");
    const [timeLimitHour, setTimeLimitHour] = useState<number | "">("");

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handlePreview = () => {
        /* nothing for now */
    };

    return (
        <div className="employer-lesson-card" ref={setNodeRef} style={style}>
            <div className="employer-lesson-card-top">
                <div className="employer-card-top-left">
                    <div className="drag-handle" {...listeners} {...attributes}>
                        <img src={drag_icon} />
                    </div>
                    <div className="lesson-title-div">
                        <div className="lesson-tag-wrapper">
                            <span>
                                <img src={type === "video" ? movie_icon : quiz_icon} />
                            </span>
                            <p className="lesson-tag employer">{position}. {type === "video" && "Video Lesson"} {type === "quiz" && "Quiz"}</p>
                        </div>
                        <div className="lesson-title employer">
                            <input type="text" placeholder="Enter new title" value={titleState} onChange={(e) => setTitleState(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="local-action-panel">
                    <div className="builder-action" onClick={() => setExpanded(prev => !prev)}>
                        <img src={expanded ? up_chevron : down_chevron} />
                    </div>               
                    <div className="builder-action" onClick={handleDelete}>
                        <img src={trash_icon} />
                    </div>
                    {(type === "quiz") && 
                    <div className="builder-action-pill" onClick={() => navigate(`/employer/quiz-builder`)}>
                        Edit Quiz
                        <span>
                            <img src={right_arrow_icon} />
                        </span>
                    </div>}
                </div>
            </div>
            { expanded &&
            <div className="employer-lesson-card-bottom">
                {
                    (type === "video") ?
                    <div className="employer-lesson-card-expanded">
                        <p className="expanded-settings-text sim-settings">Upload Content</p>
                        <UploadDropzone amount="single" video={true} files={videoFiles} setFiles={setVideoFiles}
                        allowedTypes={["video/mp4", "video/webm", "video/quicktime"]} 
                        onDelete={(file) => setVideoFiles((prev) => prev.filter((f) => f !== file))} />
                        <div className="video-lesson-settings">
                            <div className="expanded-settings-text sim-settings">
                                <span>
                                    <img src={slider_icon} />
                                </span>
                                Video Lesson Settings
                            </div>
                            <div className="check-setting">
                                <Switch defaultChecked checked={allowTranscript} onCheckedChange={() => setAllowTranscript(prev => !prev)} color="cyan" size="1" />
                                <span className="expanded-settings-text">Allow Cognition AI to generate a transcript.</span>
                            </div>
                            <div className="date-picker">
                                <span className="expanded-settings-text label">Set Due Date*</span>
                                <input type="date" value={selectedDate ?? ""} onChange={(e) => setSelectedDate(e.target.value)} className="date-input" />
                            </div>
                        </div>
                        <div className="action-panel">
                            <ActionButton buttonType="play" text="Preview Video Lesson" onClick={handlePreview} />
                        </div>
                    </div> : 
                    <div className="employer-lesson-card-expanded">
                        <div className="expanded-settings-text sim-settings">
                            <span>
                                <img src={slider_icon} />
                            </span>
                            Quiz Settings
                        </div>
                        <div className="radio-setting">
                            <p className="expanded-settings-text label">Number of Attempts</p>
                            <RadioGroup.Root defaultValue="unlimited" color="cyan" size="1" 
                            value={attemptMode} onValueChange={(value) => setAttemptMode(value as "unlimited" | "custom")}>
                                <RadioGroup.Item value="unlimited" className="expanded-settings-text">Unlimited</RadioGroup.Item>
                                <RadioGroup.Item value="custom">
                                    <input className="custom-input" type="number" min={0} 
                                    placeholder="Custom" value={customNumAttempts} 
                                    onChange={(e) => setCustomNumAttempts(e.target.value === "" ? "" : Number(e.target.value))} />
                                </RadioGroup.Item>
                            </RadioGroup.Root>
                        </div>
                        <div className="radio-setting">
                            <p className="expanded-settings-text label">Set time limit</p>
                            <RadioGroup.Root defaultValue="unlimited" color="cyan" size="1" 
                            value={timeLimitMode} onValueChange={(value) => setTimeLimitMode(value as "unlimited" | "custom")}>
                                <RadioGroup.Item value="unlimited" className="expanded-settings-text">Unlimited</RadioGroup.Item>
                                <RadioGroup.Item value="custom">
                                    <input className="custom-input time" type="number" min={0} 
                                    placeholder="00" value={timeLimitHour} 
                                    onChange={(e) => setTimeLimitHour(e.target.value === "" ? "" : Number(e.target.value))} />
                                    <span>hours </span>
                                    <input className="custom-input time" type="number" min={0} 
                                    placeholder="00" value={timeLimitMin} 
                                    onChange={(e) => setTimeLimitMin(e.target.value === "" ? "" : Number(e.target.value))} />
                                    <span>minutes</span>
                                </RadioGroup.Item>
                            </RadioGroup.Root>
                        </div>
                        <div className="date-picker">
                            <span className="expanded-settings-text label">Set Due Date*</span>
                            <input type="date" value={selectedDate ?? ""} onChange={(e) => setSelectedDate(e.target.value)} className="date-input" />
                        </div>
                        <div className="action-panel">
                            <div className="action-panel-left">
                                <ActionButton buttonType="save" text="Save Changes" /> 
                                <ActionButton buttonType="play" text="Preview Simulation" />
                            </div>
                        </div>
                    </div>
                }
            </div>}
        </div>
    );
}