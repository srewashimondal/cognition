import './LessonAbstract.css';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import type { LessonAbstractType } from "../../../types/LessonAbstractType";
import LessonAbstractItem from "../LessonAbstractItem/LessonAbstractItem";
import LessonEditButton from "../LessonEditButton/LessonEditButton";
import orange_send_icon from "../../../assets/icons/lesson-edit/orange-right-arrow-send.svg";

export default function LessonAbstract({ lessonAbstractInfo }: { lessonAbstractInfo: LessonAbstractType}) {
    const navigate = useNavigate();
    const [AIEditMode, setAIEditMode] = useState(false);
    const [editPrompt, setEditPrompt] = useState("");

    const handleAIEditSubmit = () => {
        console.log(editPrompt);
        /* More backend logic later */
    };
 
    return (
        <div className={`lesson-abstract-wrapper ${(AIEditMode) ? "expanded" : ""}`}>
            <div className="lesson-abstract">
                <p className="expanded-settings-text lesson-abst">Lesson Abstract</p>
                <p className="expanded-settings-text" >This defines how Cognition AI interprets and generates simulations for this lesson. </p>
                <div className="lesson-abstract-thread">
                    <div className="thread-filler"/>
                    <LessonAbstractItem itemName="Simulation Model" content={lessonAbstractInfo.simulationModel ?? ""} />
                    <LessonAbstractItem itemName="Target Behaviors" content={lessonAbstractInfo.targetBehaviors ?? ""} />
                    <LessonAbstractItem itemName="Contextual Constraints" content={lessonAbstractInfo.contextualConstraints ?? ""} />
                    <LessonAbstractItem itemName="Evaluation Signals" content={lessonAbstractInfo.evaluationSignals ?? ""} />
                    <LessonAbstractItem itemName="Adaption Logic" content={lessonAbstractInfo.adaptionLogic ?? ""} />
                </div>
                {(AIEditMode) && (
                    <form onSubmit={handleAIEditSubmit}>
                        <div className="ai-input-wrapper">
                            <input type="text" placeholder="Tell Cognition AI what to adjust..." value={editPrompt} onChange={(e) => (setEditPrompt(e.target.value))}/>
                            <button className="ai-input-edit-send" type="submit">
                                <img src={orange_send_icon}/>
                            </button>
                        </div>
                    </form>
                )}
            </div>
            <div className="lesson-abstract-actions">
                    <LessonEditButton buttonType="ai-edit" onClick={() => (setAIEditMode(!AIEditMode))} selected={AIEditMode}/>
                    <LessonEditButton buttonType="upload" onClick={() => (navigate(`/employer/ai-studio`))}/>
            </div>
        </div>
    );
}