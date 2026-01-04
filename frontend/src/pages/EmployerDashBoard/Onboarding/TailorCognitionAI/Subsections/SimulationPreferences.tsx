import Question from '../../Question/Question';
import type { OnboardingSubsection } from '../../../../../types/OnboardingSubsection';

export default function SimulationPreferences({ data, updateData }: OnboardingSubsection) {
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        {/* put in backend logic later */}
    }

    return (
        <div className="sp-div">
            <form onSubmit={handleSubmit}>

                <Question question={"Select preferred scenario types"} input_type={"checkbox"} 
                value={data.scenTypes} onChange={(v) => updateData({ scenTypes: v})} options={["Everyday customer interactions", "Emergency Situations"]} />

                <Question question={"Select a difficulty level"} input_type={"select"} 
                value={data.difficultyLevel} onChange={(v) => updateData({ difficultyLevel: v})} options={["Beginner", "Mixed", "Advanced"]}/>

            </form>
        </div>
    );
}