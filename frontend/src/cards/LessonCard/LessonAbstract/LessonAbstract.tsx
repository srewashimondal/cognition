import './LessonAbstract.css';
import type { LessonAbstractType } from "../../../types/Modules/Lessons/LessonAbstractType";
import LessonAbstractItem from "../LessonAbstractItem/LessonAbstractItem";

export default function LessonAbstract({ lessonAbstractInfo }: { lessonAbstractInfo?: LessonAbstractType}) {
    if (!lessonAbstractInfo) {
        return null;
    }
 
    return (
        <div className="lesson-abstract-wrapper">
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
            </div>
        </div>
    );
}