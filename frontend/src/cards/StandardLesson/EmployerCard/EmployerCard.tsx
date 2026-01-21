import './EmployerCard.css';
import { useState } from 'react';
import UploadDropzone from '../../../components/UploadDropzone/UploadDropzone';
import { Checkbox } from "@radix-ui/themes";
import trash_icon from '../../../assets/icons/simulations/grey-trash-icon.svg';
import movie_icon from '../../../assets/icons/simulations/grey-movie-icon.svg';
import slider_icon from '../../../assets/icons/simulations/black-slider-icon.svg';
import down_chevron from '../../../assets/icons/simulations/grey-down-chevron.svg';
import up_chevron from '../../../assets/icons/simulations/grey-up-chevron.svg';


type EmployerCardProps = {
    id: number;
    title: string;
    type: "video" | "quiz";
    handleDelete: () => void;
};

export default function EmployerCard({ id, title, type, handleDelete }: EmployerCardProps) {
    const [titleState, setTitleState] = useState(title);
    const [videoFiles, setVideoFiles] = useState<File[]>([]);
    const [allowTranscript, setAllowTranscript] = useState(false);
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="employer-lesson-card">
            <div className="employer-lesson-card-top">
                <div className="lesson-tag-wrapper">
                    <span>
                        <img src={movie_icon} />
                    </span>
                    <p className="lesson-tag employer">{type === "video" && "Video Lesson"} {type === "quiz" && "Quiz"}</p>
                </div>
                <div className="lesson-title employer">
                    <input type="text" placeholder="Enter new title" value={titleState} onChange={(e) => setTitleState(e.target.value)} />
                </div>
                <div className="local-action-panel">
                    <div className="builder-action" onClick={() => setExpanded(prev => !prev)}>
                        <img src={expanded ? up_chevron : down_chevron} />
                    </div>
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
                        </div>
                    </div>
                    : <></>
                }
            </div>}
        </div>
    );
}