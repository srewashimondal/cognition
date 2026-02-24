import './LessonCard.css';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from "@radix-ui/themes";
import type { LessonType } from '../../types/Modules/Lessons/LessonType';
import type { LessonEvaluationType } from '../../types/Modules/Lessons/LessonEvaluationType';
import SkillItem from './SkillItem/SkillItem';
import LessonAbstract from './LessonAbstract/LessonAbstract';
import ActionButton from '../../components/ActionButton/ActionButton';
import SkillsPopover from './SkillsPopover/SkillsPopover';
import { RadioGroup, Slider, CheckboxGroup, Switch } from "@radix-ui/themes";
import edit_icon from '../../assets/icons/simulations/grey-edit-icon.svg';
import refresh_icon from '../../assets/icons/simulations/grey-refresh-icon.svg';
import check_icon from '../../assets/icons/simulations/grey-check-icon.svg';
import green_plus from '../../assets/icons/lesson-edit/green-plus.svg';
import lock_icon from '../../assets/icons/simulations/black-lock-icon.svg';
import clock_icon from '../../assets/icons/simulations/black-clock-icon.svg';
import slider_icon from '../../assets/icons/simulations/black-slider-icon.svg';
import green_check from '../../assets/icons/green-check-icon.svg';

type LessonProp = {
    lessonInfo: LessonType;
    role: "employer" | "employee";
    status?: "not begun" | "started" | "completed" | "locked";
    evaluation?: LessonEvaluationType;
    navigateToSim?: () => void;
    moduleID?: string;
    onSkillsChange?: (skills: string[]) => void;
    onSettingsChange?: (updates: Partial<LessonType>) => void;
    onDueDateChange?: (date: string | null) => void;
};

export default function LessonCard({ lessonInfo, role, status, evaluation, navigateToSim, moduleID, onSkillsChange, onSettingsChange, onDueDateChange }: LessonProp) {
    const navigate = useNavigate();

    const id = lessonInfo.id;
    const title = lessonInfo.title;
    const orderNumber = lessonInfo.orderNumber;

    const [expanded, setExpanded] = useState(false);
    const skills = lessonInfo.skills;
    const attemptMode = lessonInfo.allowUnlimitedAttempts;
    const customNumAttempts = lessonInfo.numAttempts;
    const criteria = lessonInfo.criteria;

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
        parseDateString(lessonInfo.dueDate)
    );
    
    useEffect(() => {
        if (lessonInfo.dueDate) {
            setSelectedDate(parseDateString(lessonInfo.dueDate));
        }
    }, [lessonInfo.dueDate]);

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
    
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);

    const buttonLabelsByStatus = {
        "not begun": "Begin",
        "started": "Continue",
        "completed": "Review",
        "locked": "Locked"
    };

    const statusLabelbyStatus = {
        "not begun": "Pending",
        "started": "Progress",
        "completed": "Done",
        "locked": "Locked"
    }

    const removeSkill = (skillToRemove: string) => {
        if (role !== "employer") return;
    
        const updatedSkills = lessonInfo.skills.filter(
            skill => skill !== skillToRemove
        );
    
        onSkillsChange?.(updatedSkills);
    };

    const addSkill = (skillToAdd: string) => {
        if (lessonInfo.skills.includes(skillToAdd)) {
            setError("Skill already added.");
            return;
        }
    
        setError(null);
        const updatedSkills = [...lessonInfo.skills, skillToAdd];
        onSkillsChange?.(updatedSkills);
    };
    
    const [clicked, setClicked] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!clicked) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setClicked(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [clicked]);

    const handleNavigateEmployee = () => {
        if (status === "completed") {
            setExpanded(prev => !prev);
            return; 
        }

        if (status !== "locked") {
            navigateToSim?.();
        }
    }

    const handleSave = () => {
        
    };

    const handlePreview = () => {
        navigate(`/employer/simulations/${moduleID}/${id}/1`);
    };

    const handleRefresh = () => {
        /* nothing for now */
    };

    const handleLessonReset = () => {
        /* nothing for now */
    };

    return (
        <div key={id} className={`lesson-card ${(expanded) ? ("expanded") : ("")} ${status}`}>
            <div className="lesson-card-top">
                <div className="lesson-info lesson-title-section">
                    <div className="lesson-name-wrapper">
                        <p className="lesson-tag">{orderNumber}. Lesson</p>
                        <h3 className="lesson-title">{title}</h3>
                        {status === "locked" && <p className="lock-warning">Complete Previous Lesson to Unlock</p>}
                    </div>
                    <div className="lesson-meta-wrapper">
                        { (status === "completed") &&
                            <div className="lesson-skills time complete">
                                <span>
                                    <img src={green_check} />
                                </span>
                                Completed
                            </div>
                        }
                        <div className="lesson-skills time">
                            <span>
                                <img src={clock_icon} />
                            </span>
                            30 min
                        </div>
                        <div className="lesson-skills">
                            <span>Skills</span>
                            {skills.map((s) => (<SkillItem skill={s} expanded={expanded} role={role} onClick={() => (removeSkill(s))} />))}
                            {(expanded && role === "employer") && (
                                <div className="add-skill-popover-wrapper" ref={wrapperRef}>
                                    <div className="add-skill" onClick={(e) => {e.stopPropagation(); setClicked(true);}}>
                                        <span className="green-plus-icon">
                                            <img src={green_plus}/>
                                        </span>
                                        <span>Add skill</span>
                                    </div>
                                    {(clicked && expanded) && <SkillsPopover actionType="add" search={search} setSearch={setSearch} addSkill={addSkill} error={error} />}
                            </div>)}
                        </div>
                    </div>
                </div>
                {(role === "employee") &&
                <>
                    {/*<p className={`lesson-info lesson-duration ${role}`}>{duration}m</p>*/}
                    <p className={`lesson-info lesson-due ${role}`}>{lessonInfo.dueDate}</p>
                    <div className={`lesson-info lesson-status ${statusLabelbyStatus[status ?? "not begun"]} ${role}`}>
                        <div className="lesson-status-dot" />
                        {statusLabelbyStatus[status ?? "not begun"]}
                    </div>
                </>}
                { (role === "employer") ?
                    (<div className="local-action-panel">
                        <Tooltip content={expanded ? "Close" : "Edit"}>
                            <div className="builder-action" onClick={() => setExpanded(prev => !prev)}>
                                <img src={expanded ? check_icon : edit_icon} />
                            </div>
                        </Tooltip>
                        <Tooltip content="Refresh">
                            <div className="builder-action">
                                <img src={refresh_icon} />
                            </div>
                        </Tooltip>
                    </div>) :
                    (<button className={`lesson-action-btn ${buttonLabelsByStatus[status ?? "not begun"]}`} onClick={handleNavigateEmployee}>
                        {(status === "locked") && 
                        <span>
                            <img src={lock_icon} />
                        </span>}
                        {buttonLabelsByStatus[status ?? "not begun"]}
                    </button>)
                }
            </div>
            {
                (expanded && role === "employer") && (
                    <div className="lesson-card-expanded">
                        <LessonAbstract lessonAbstractInfo={lessonInfo.lessonAbstractInfo}/>
                        <div className="expanded-settings">
                            <div className="expanded-settings-text sim-settings">
                                <span>
                                    <img src={slider_icon} />
                                </span>
                                Simulation Settings
                            </div>
                            <form>
                                <div className="radio-setting">
                                    <p className="expanded-settings-text label">Number of Attempts</p>
                                    <RadioGroup.Root defaultValue="unlimited" color="orange" size="1" 
                                    value={lessonInfo.allowUnlimitedAttempts ? "unlimited" : "custom"} 
                                    onValueChange={(value) => onSettingsChange?.({
                                            allowUnlimitedAttempts: value === "unlimited",
                                            numAttempts: value === "custom" ? lessonInfo.numAttempts ?? 1 : undefined
                                        })
                                    }
                                    >
                                        <RadioGroup.Item value="unlimited" className="expanded-settings-text">Unlimited</RadioGroup.Item>
                                        <RadioGroup.Item value="custom">
                                            <input className="custom-input" type="number" min={0} 
                                            placeholder="Custom" value={customNumAttempts} 
                                            onChange={(e) =>
                                                onSettingsChange?.({
                                                    numAttempts: e.target.value === ""
                                                        ? undefined
                                                        : Number(e.target.value)
                                                })
                                            }
                                             />
                                        </RadioGroup.Item>
                                    </RadioGroup.Root>
                                </div>
                                <div className="slider-setting">
                                    <span className="expanded-settings-text label">Customer Mood</span>
                                    <Slider value={[lessonInfo.customerMood ?? 33]} color="orange" onValueChange={(value) =>onSettingsChange?.({ customerMood: value[0] })}/>
                                    <div className="slider-labels expanded-settings-text">
                                        <p>Calm</p> 
                                        <p>Neutral</p>
                                        <p>Frustrated</p>
                                        <p>Angry</p>
                                    </div>
                                </div>
                                <div className="check-setting eval">
                                    <span className="expanded-settings-text label">Evaluation Criteria</span>
                                    <CheckboxGroup.Root value={criteria} onValueChange={(vals) => onSettingsChange?.({ criteria: vals })}
                                    className="checkbox-group" size="2" color="orange">
                                        <CheckboxGroup.Item value={"Empathy & Tone"}>
                                            <span className="expanded-settings-text">Empathy & Tone</span>
                                        </CheckboxGroup.Item>
                                        <CheckboxGroup.Item value={"Policy Adherence"}>
                                            <span className="expanded-settings-text">Policy Adherence</span>
                                        </CheckboxGroup.Item>
                                        <CheckboxGroup.Item value={"Problem Resolution"}>
                                            <span className="expanded-settings-text">Problem Resolution</span>
                                        </CheckboxGroup.Item>
                                        <CheckboxGroup.Item value={"Communication Clarity"}>
                                            <span className="expanded-settings-text">Communication Clarity</span>
                                        </CheckboxGroup.Item>
                                    </CheckboxGroup.Root>
                                </div>
                                <div className="date-picker">
                                    <span className="expanded-settings-tex label">Set Due Date*</span>
                                    <input type="date" value={selectedDate ?? ""}
                                        onChange={handleDateChange}
                                    className="date-input" />
                                </div>
                            </form>
                        </div>
                        <div className="action-panel">
                            <div className="action-panel-left">
                                {/*<ActionButton buttonType="save" text="Save Changes" onClick={handleSave} selected={changesMade} />*/}
                                <ActionButton buttonType="play" text="Preview Simulation" onClick={handlePreview} />
                            </div>
                            {/*<div className="action-panel-right">
                                <ActionButton buttonType="refresh" text="Reset to Default" onClick={handleRefresh} />
                            </div>*/}
                        </div>
                    </div>
                )
            }
            {
                (expanded && role === "employee") && (
                    <div className="lesson-card-expanded">
                        <p className="expanded-settings-label">Cognition Evaluation & Stats</p>
                        <div className="eval-wrapper">
                            <div className="eval-left">
                                <div className="eval-box strengths">
                                    <p className="eval-label green">Strengths</p>
                                    <p className="expanded-settings-text black">{evaluation?.strengths}</p>
                                </div>
                                <div className="eval-box shortcomings">
                                    <p className="eval-label red">Shortcomings</p>
                                    <p className="expanded-settings-text black">{evaluation?.shortcomings}</p>
                                </div>
                            </div>
                            <div className="eval-box overall">
                                <p className="eval-label orange">Overall Feedback</p>
                                <p className="expanded-settings-text black">{evaluation?.overallFeedback}</p>
                            </div>
                        </div>
                        <div className="employee-action-panel">
                            <ActionButton text={"Reset Lesson"} buttonType={"refresh"} onClick={handleLessonReset} reversed={true} />
                        </div>
                    </div>
                )
            }
        </div>
    );
}