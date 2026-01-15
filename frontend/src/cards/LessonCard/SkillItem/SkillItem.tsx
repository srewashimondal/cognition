import './SkillItem.css';
import { useState, useRef, useEffect } from 'react';
import SkillsPopover from '../SkillsPopover/SkillsPopover';
import blue_trash from '../../../assets/icons/lesson-edit/blue-trash.svg';

type SkillItemProps = {
    skill: string;
    expanded?: boolean;
    role?: "employee" | "employer";
    onClick?: () => void;
    toAdd?: boolean;
    onAdd?: () => void;
}

export default function SkillItem({ skill, expanded=false, role, onClick, toAdd, onAdd }: SkillItemProps) {
    const [clicked, setClicked] = useState(false);
    const handleClick = () => {
        if (expanded) {
            onClick?.();
        }
        if (toAdd) {
            onAdd?.();
        }
    };

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
       
    return (
        <div className="skill-popover-wrapper" ref={wrapperRef}>
            <div className={`skill-item ${(expanded) ? "expanded": ""}`} onClick={(e) => {e.stopPropagation(); setClicked(true); if (!expanded) {handleClick();}}}>
                <span>{skill}</span>
                {(expanded && role === "employer") && (<span className="blue-trash-icon">
                    <img src={blue_trash} />
                </span>)}
            </div>
            {(clicked && expanded) && <SkillsPopover actionType="delete" onClick={handleClick}/>}
        </div>
    );
}