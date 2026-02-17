import './EmployerCard.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { StandardLessonType, VideoLessonType, QuizLessonType } from '../../../types/Standard/StandardLessons';
import UploadDropzone from '../../../components/UploadDropzone/UploadDropzone';
import ActionButton from '../../../components/ActionButton/ActionButton';
import { RadioGroup, Switch, Slider, Tooltip } from "@radix-ui/themes";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase';
import trash_icon from '../../../assets/icons/simulations/grey-trash-icon.svg';
import movie_icon from '../../../assets/icons/simulations/grey-movie-icon.svg';
import quiz_icon from '../../../assets/icons/simulations/grey-quiz-icon.svg';
import slider_icon from '../../../assets/icons/simulations/black-slider-icon.svg';
import down_chevron from '../../../assets/icons/simulations/grey-down-chevron.svg';
import up_chevron from '../../../assets/icons/simulations/grey-up-chevron.svg';
import drag_icon from '../../../assets/icons/grey-drag-icon.svg';
import right_arrow_icon from '../../../assets/icons/simulations/grey-right-arrow.svg';

type EmployerCardProps = {
    handleDelete: () => void;
    lesson: StandardLessonType;
    isNewDraft: boolean;
    navigateQuiz: () => void;
    onTitleChange: (newTitle: string) => void;
    onVideoFileChange?: (file: File) => void;
    onVideoSettingsChange?: (settings: Partial<VideoLessonType>) => void;
    onQuizSettingsChange?: (settings: Partial<QuizLessonType>) => void;
    onDueDateChange?: (date: string | null) => void;
    onDeleteVideo?: () => void;
};

export default function EmployerCard({ handleDelete, lesson, isNewDraft, navigateQuiz, onTitleChange, onVideoFileChange, 
                                        onVideoSettingsChange, onQuizSettingsChange, onDueDateChange, onDeleteVideo
                                        }: EmployerCardProps) {
    const navigate = useNavigate();
    const titleState = lesson.title;
    const [videoFiles, setVideoFiles] = useState<File[]>([]);
    const videoFilePath = lesson.type === "video" ? lesson.videoFilePath : undefined;
    const [loading, setLoading] = useState(!!videoFilePath);
    const [expanded, setExpanded] = useState(false);
    /* const [attemptMode, setAttemptMode] = useState<"unlimited" | "custom">("unlimited");
    const [customNumAttempts, setCustomNumAttempts] = useState<number | "">("");
    const [timeLimitMode, setTimeLimitMode] = useState<"unlimited" | "custom">("unlimited");
    const [timeLimitMin, setTimeLimitMin] = useState<number | "">("");
    const [timeLimitHour, setTimeLimitHour] = useState<number | "">(""); */
    const [benchmark, setBenchmark] = useState<number[]>(lesson.type === "quiz" ? [lesson.passingScore ?? 70] : [70]);

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    useEffect(() => {
        if (!lesson.isTemp && videoFilePath) {
            const loadVideoPlaceholder = async () => {
                try {
                    setLoading(true);
                    const placeholderFile = await createVideoPlaceholder(videoFilePath);
                    setVideoFiles([placeholderFile]);
                } catch (err) {
                    console.error('Failed to load video placeholder:', err);
                } finally {
                    setLoading(false);
                }
            };
            loadVideoPlaceholder();
        } 

        else if (!videoFilePath) {
            setVideoFiles([]);
        }
    
    }, [videoFilePath]);
    

    useEffect(() => {
        console.log("Component mounted with videoFilePath:", videoFilePath);
    }, []);

    const createVideoPlaceholder = async (storagePath: string): Promise<File> => {
        console.log(`📹 Creating placeholder for: ${storagePath}`);
        
        try {
            const videoRef = ref(storage, storagePath);
            await getDownloadURL(videoRef);
            const filename = storagePath.split('/').pop() || 'video.mp4';
            const file = new File([' '], filename, { type: 'video/mp4' });
            
            console.log(`Created placeholder for: ${filename}`);
            return file;
            
        } catch (error) {
            console.error('Failed to create video placeholder:', error);
            throw error;
        }
    };

    const handlePreview = () => {
        /* nothing for now */
    };

    const handleNavigate = () => {
        /*if (isNewDraft) {
            navigate(`/employer/modules/quiz-builder`);
            return;
        }*/
        navigateQuiz();
    };

    // handle changes

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onTitleChange(e.target.value);
    };

    const handleFileSelected = (files: File[] | React.SetStateAction<File[]>) => {
        if (typeof files === 'function') {
            const newFiles = files(videoFiles);
            if (newFiles[0] && onVideoFileChange) {
                onVideoFileChange(newFiles[0]);
            }
            setVideoFiles(newFiles);
        } else {
            if (files[0] && onVideoFileChange) {
                onVideoFileChange(files[0]);
            }
            setVideoFiles(files);
        }
    };
    
    const handleTranscriptChange = (checked: boolean) => {
        if (lesson.type === "video" && onVideoSettingsChange) {
            onVideoSettingsChange({ allowTranscript: checked });
        }
    };
    
    const handleSummaryChange = (checked: boolean) => {
        if (lesson.type === "video" && onVideoSettingsChange) {
            onVideoSettingsChange({ allowSummary: checked });
        }
    };

    const parseDateString = (dateString: string | null | undefined): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return ''; 
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    };
    
    const [selectedDate, setSelectedDate] = useState<string>(
        parseDateString(lesson.dueDate)
    );
    
    useEffect(() => {
        if (lesson.dueDate) {
            setSelectedDate(parseDateString(lesson.dueDate));
        }
    }, [lesson.dueDate]);
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value; 
        
        if (dateValue) {
            const date = new Date(dateValue);
            const formattedDate = date.toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            onDueDateChange?.(formattedDate);
            setSelectedDate(dateValue); 
        } else {
            onDueDateChange?.(null);
            setSelectedDate('');
        }
    };

    const handleAttemptModeChange = (value: "unlimited" | "custom") => {
        if (lesson.type === "quiz" && onQuizSettingsChange) {
            onQuizSettingsChange({ retakeMode: value });
        }
        // setAttemptMode(value);
    };

    const handleCustomAttemptsChange = (value: number | "") => {
        if (lesson.type === "quiz" && onQuizSettingsChange) {
            onQuizSettingsChange({ numberOfRetakes: value === "" ? undefined : value });
            // setCustomNumAttempts(value);
        }
    };
    
    const handleTimeLimitModeChange = (value: "unlimited" | "custom") => {
        if (lesson.type === "quiz" && onQuizSettingsChange) {
            onQuizSettingsChange({ timeLimitMode: value });
            // setTimeLimitMode(value);
        }
    };
    
    const handleTimeLimitHourChange = (value: number | "") => {
        if (lesson.type === "quiz" && onQuizSettingsChange) {
            onQuizSettingsChange({ timeLimitHour: value === "" ? undefined : value });
            // setTimeLimitHour(value);
        }
    };
    
    const handleTimeLimitMinChange = (value: number | "") => {
        if (lesson.type === "quiz" && onQuizSettingsChange) {
            onQuizSettingsChange({ timeLimitMinute: value === "" ? undefined : value });
            // setTimeLimitMin(value);
        }
    };
    
    const handleBenchmarkChange = (value: number[]) => {
        setBenchmark(value);
        if (lesson.type === "quiz" && onQuizSettingsChange) {
            onQuizSettingsChange({ passingScore: value[0] });
        }
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
                                <img src={lesson.type === "video" ? movie_icon : quiz_icon} />
                            </span>
                            <p className="lesson-tag employer">{lesson.orderNumber}. {lesson.type === "video" && "Video Lesson"} {lesson.type === "quiz" && "Quiz"}</p>
                        </div>
                        <div className="lesson-title employer">
                            <input type="text" placeholder="Enter new title" value={titleState} onChange={handleTitleChange} />
                        </div>
                    </div>
                </div>
                <div className="local-action-panel">
                    <Tooltip content={expanded ? "Close" : "Lesson settings"}>
                        <div className="builder-action" onClick={() => setExpanded(prev => !prev)}>
                            <img src={expanded ? up_chevron : down_chevron} />
                        </div>           
                    </Tooltip>
                    <Tooltip content="Delete lesson">
                        <div className="builder-action" onClick={handleDelete}>
                            <img src={trash_icon} />
                        </div>
                    </Tooltip>
                    {(lesson.type === "quiz") && 
                    <div className="builder-action-pill" onClick={handleNavigate}>
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
                    (lesson.type === "video") ?
                    <div className="employer-lesson-card-expanded">
                        <p className="expanded-settings-text sim-settings">Upload Content</p>
                        {loading ? 
                            (<div className="loading-video">Loading video...</div>) 
                            : (<UploadDropzone amount="single" video={true} files={videoFiles} setFiles={handleFileSelected}
                            allowedTypes={["video/mp4", "video/webm", "video/quicktime"]} 
                            onDelete={(file) => {
                                setVideoFiles((prev) => prev.filter((f) => f !== file));
                                onDeleteVideo?.();
                            }}
                            />)
                        }
                        <div className="video-lesson-settings">
                            <div className="expanded-settings-text sim-settings">
                                <span>
                                    <img src={slider_icon} />
                                </span>
                                Video Lesson Settings
                            </div>
                            <div className="check-setting">
                                <Switch defaultChecked checked={lesson.allowTranscript} onCheckedChange={handleTranscriptChange} color="cyan" size="1" />
                                <span className="expanded-settings-text">Allow Cognition AI to generate a transcript.</span>
                            </div>
                            <div className="check-setting">
                                <Switch defaultChecked checked={lesson.allowSummary} onCheckedChange={handleSummaryChange} color="cyan" size="1" />
                                <span className="expanded-settings-text">Allow Cognition AI to generate section-based summaries.</span>
                            </div>
                            <div className="date-picker">
                                <span className="expanded-settings-text label">Set Due Date*</span>
                                <input type="date" value={selectedDate ?? ""} onChange={handleDateChange} className="date-input" />
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
                            value={lesson.retakeMode} onValueChange={handleAttemptModeChange}>
                                <RadioGroup.Item value="unlimited" className="expanded-settings-text">Unlimited</RadioGroup.Item>
                                <RadioGroup.Item value="custom">
                                    <input className="custom-input" type="number" min={0} 
                                    placeholder="Custom" value={lesson.numberOfRetakes} 
                                    onChange={(e) => {
                                        const value = e.target.value === "" ? "" : Number(e.target.value);
                                        handleCustomAttemptsChange(value);
                                    }} />
                                </RadioGroup.Item>
                            </RadioGroup.Root>
                        </div>
                        <div className="radio-setting">
                            <p className="expanded-settings-text label">Set time limit</p>
                            <RadioGroup.Root defaultValue="unlimited" color="cyan" size="1" 
                            value={lesson.timeLimitMode} onValueChange={handleTimeLimitModeChange}>
                                <RadioGroup.Item value="unlimited" className="expanded-settings-text">Unlimited</RadioGroup.Item>
                                <RadioGroup.Item value="custom">
                                    <input className="custom-input time" type="number" min={0} 
                                    placeholder="00" value={lesson.timeLimitHour} 
                                    onChange={(e) => {
                                        const value = e.target.value === "" ? "" : Number(e.target.value);
                                        handleTimeLimitHourChange(value);
                                    }} />
                                    <span>hours </span>
                                    <input className="custom-input time" type="number" min={0} 
                                    placeholder="00" value={lesson.timeLimitMinute} 
                                    onChange={(e) => {
                                        const value = e.target.value === "" ? "" : Number(e.target.value);
                                        handleTimeLimitMinChange(value);
                                    }} />
                                    <span>minutes</span>
                                </RadioGroup.Item>
                            </RadioGroup.Root>
                        </div>
                        <div className="slider-setting quiz">
                                <span className="expanded-settings-text label">Set passing benchmark</span>
                            <div className="slider-labels expanded-settings-text quiz">
                                <Slider defaultValue={benchmark} value={benchmark} onValueChange={handleBenchmarkChange} color="orange" step={5} max={95} />
                                {benchmark}%
                            </div>
                        </div>
                        <div className="date-picker">
                            <span className="expanded-settings-text label">Set Due Date*</span>
                            <input type="date" value={selectedDate ?? ""} onChange={handleDateChange} className="date-input" />
                        </div>
                        <div className="action-panel">
                            <div className="action-panel-left">
                                <ActionButton buttonType="play" text="Preview Quiz" />
                            </div>
                        </div>
                    </div>
                }
            </div>}
        </div>
    );
}