import Question from '../../Question/Question';
import type { OnboardingSubsection } from '../../../../../types/OnboardingSubsection';

export default function TeamDetails({ data, updateData }: OnboardingSubsection) {
    return (
        <div className="td-div">

            <Question question={"Team Size"} input_type={"range"} 
            value={data.numEmployees} onChange={(v) => updateData({ numEmployees: v})} 
            direction={"Select a range."}/>

            <Question question={"Average Experience Level"} input_type={"radio"} 
            value={data.expLevel} onChange={(v) => updateData({ expLevel: v})} options={["Mostly first-time workers", "Mostly experienced staff", "Mixed experience"]}
            direction={"Select an option."}/>

            <Question question={"Primary Onboarding Challenges"} input_type={"checkbox"} 
            value={data.challenge} onChange={(v) => updateData({ challenge: v})} 
            options={["Product Knowledge", "Store Navigation", "Customer Service", "Confidence Under Pressure"]}
            direction={"Select all that apply."}/>

        </div>
    );
}