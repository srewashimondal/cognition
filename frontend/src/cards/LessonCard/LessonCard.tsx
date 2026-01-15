import './LessonCard.css';
import { useState, useEffect, useRef } from 'react';
import type { LessonType } from '../../types/Modules/Lessons/LessonType';
import SkillItem from './SkillItem/SkillItem';
import LessonAbstract from './LessonAbstract/LessonAbstract';
import ActionButton from '../../components/ActionButton/ActionButton';
import SkillsPopover from './SkillsPopover/SkillsPopover';
import { Checkbox, RadioGroup } from "@radix-ui/themes";
import orange_edit_icon from '../../assets/icons/orange-edit-icon.svg';
import orange_check_icon from '../../assets/icons/orange-check.svg';
import green_plus from '../../assets/icons/lesson-edit/green-plus.svg';

type LessonProp = {
    lessonInfo: LessonType;
    /* Later add an "employer | employee" item to differentiate between the two types of lesson cards */
};

export default function LessonCard({ lessonInfo }: LessonProp) {
    const id = lessonInfo.id;
    const title = lessonInfo.title;
    const duration = lessonInfo.duration;
    const dueDate = lessonInfo.dueDate;

    const [skills, setSkills] = useState<string[]>(lessonInfo.skills);
    const [expanded, setExpanded] = useState(false);
    const [attemptMode, setAttemptMode] = useState<"unlimited" | "custom">("unlimited");
    const [customNumAttempts, setCustomNumAttempts] = useState<number | "">("");
    const [changesMade, setChangesMade] = useState(false);
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);

    const removeSkill = (skillToRemove: string) => {
        setSkills(prev => prev.filter(skill => skill !== skillToRemove));
        setChangesMade(true);
    };

    const addSkill = (skillToAdd: string) => {
        setSkills(prev => {
            if (prev.includes(skillToAdd)) {
                setError("Skill already added.")
                return prev;
            }

            setError(null);
            return [...prev, skillToAdd]
        });
        setChangesMade(true);
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


    const handleCheck = () => {
        lessonInfo.randomize = !lessonInfo.randomize;
        console.log(lessonInfo.randomize);
    };

    const handleSave = () => {
        setChangesMade(false);
    };

    const handlePreview = () => {
        /* nothing for now */
    };

    const handleRefresh = () => {
        /* nothing for now */
    };

    return (
        <div key={id} className={`lesson-card ${(expanded) ? ("expanded") : ("")}`}>
            <div className="lesson-card-top">
                <div className="lesson-info lesson-title-section">
                    <p className="lesson-title">{id}. {title}</p>
                    <div className="lesson-skills">
                        <span>Skills</span>
                        {skills.map((s) => (<SkillItem skill={s} expanded={expanded} onClick={() => (removeSkill(s))} />))}
                        {(expanded) && (
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
                <p className="lesson-info lesson-duration">{duration}m</p>
                <p className="lesson-info lesson-due">{dueDate}</p>
                <button className={`expand-btn ${(expanded) ? ("expanded") : ("")}`} onClick={() => {setExpanded(!expanded); console.log(id, ": ", expanded);}}>
                    <img src={(expanded) ? (orange_check_icon) : (orange_edit_icon)} />
                </button>
            </div>
            {
                (expanded) && (
                    <div className="lesson-card-expanded">
                        <LessonAbstract lessonAbstractInfo={lessonInfo.lessonAbstractInfo}/>
                        <div className="expanded-settings">
                            <form onChange={() => setChangesMade(true)}>
                                <div className="radio-setting">
                                    <p className="expanded-settings-text">Number of Attempts</p>
                                    <RadioGroup.Root defaultValue="unlimited" color="orange" size="1" 
                                    value={attemptMode} onValueChange={(value) => setAttemptMode(value as "unlimited" | "custom")}>
                                        <RadioGroup.Item value="unlimited" className="expanded-settings-text">Unlimited</RadioGroup.Item>
                                        <RadioGroup.Item value="custom">
                                            <input className="custom-input" type="number" min={0} 
                                            placeholder="Custom" value={customNumAttempts} 
                                            onChange={(e) => setCustomNumAttempts(e.target.value === "" ? "" : Number(e.target.value))} />
                                        </RadioGroup.Item>
                                    </RadioGroup.Root>
                                </div>
                                <div className="check-setting">
                                    <Checkbox defaultChecked onCheckedChange={handleCheck} color="orange" />
                                    <span className="expanded-settings-text">Randomize each attempt</span>
                                </div>
                            </form>
                        </div>
                        <div className="action-panel">
                            <div className="action-panel-left">
                                <ActionButton buttonType="save" text="Save Changes" onClick={handleSave} selected={changesMade} />
                                <ActionButton buttonType="play" text="Preview Simulation" onClick={handlePreview} />
                            </div>
                            <div className="action-panel-right">
                                <ActionButton buttonType="refresh" text="Reset to Default" onClick={handleRefresh} />
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}