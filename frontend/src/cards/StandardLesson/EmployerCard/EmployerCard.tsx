import './EmployerCard.css';
import { useState } from 'react';
import UploadDropzone from '../../../components/UploadDropzone/UploadDropzone';
import ActionButton from '../../../components/ActionButton/ActionButton';
import { Checkbox } from "@radix-ui/themes";
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
    const [titleState, setTitleState] = useState(title);
    const [videoFiles, setVideoFiles] = useState<File[]>([]);
    const [allowTranscript, setAllowTranscript] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
                    {(type === "video") ? <div className="builder-action" onClick={() => setExpanded(prev => !prev)}>
                        <img src={expanded ? up_chevron : down_chevron} />
                    </div>
                    : <div className="builder-action-pill">
                        Edit Quiz
                        <span>
                            <img src={right_arrow_icon} />
                        </span>
                    </div>
                    }
                    <div className="builder-action" onClick={handleDelete}>
                        <img src={trash_icon} />
                    </div>
                </div>
            </div>
            { expanded &&
            <div className="employer-lesson-card-bottom">
                {
                    (type === "video") ?
                    <div className="employer-lesson-card-video">
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
                                <Checkbox defaultChecked onCheckedChange={() => setAllowTranscript(prev => !prev)} color="orange" />
                                <span className="expanded-settings-text">Allow Cognition AI to generate a transcript.</span>
                            </div>
                            <div className="date-picker">
                                <span className="expanded-settings-text">Set Due Date*</span>
                                <input type="date" value={selectedDate ?? ""} onChange={(e) => setSelectedDate(e.target.value)} className="date-input" />
                            </div>
                        </div>
                        <div className="action-panel">
                            <ActionButton buttonType="play" text="Preview Video Lesson" onClick={handlePreview} />
                        </div>
                    </div>
                    : <></>
                }
            </div>}
        </div>
    );
}