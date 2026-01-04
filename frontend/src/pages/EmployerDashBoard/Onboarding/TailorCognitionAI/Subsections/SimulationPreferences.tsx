import { useState } from 'react';
import Question from '../../Question/Question';

export default function SimulationPreferences() {
    const [scenTypes, setScenTypes] = useState<string[]>([]);
    const [difficultyLevel, setDifficultyLevel] = useState("Beginner");

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        {/* put in backend logic later */}
    }

    return (
        <div className="sp-div">
            <form onSubmit={handleSubmit}>

                <Question question={"Select preferred scenario types"} input_type={"checkbox"} 
                value={scenTypes} onChange={setScenTypes} options={["Everyday customer interactions", "Emergency Situations"]} />

                <Question question={"Select a difficulty level"} input_type={"select"} 
                value={difficultyLevel} onChange={setDifficultyLevel} options={["Beginner", "Mixed", "Advanced"]}/>

            </form>
        </div>
    );
}