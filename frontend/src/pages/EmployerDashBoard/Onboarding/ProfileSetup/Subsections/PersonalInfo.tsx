import './PersonalInfo.css';
import Question from '../../Question/Question.tsx'
import type { OnboardingSubsection } from '../../../../../types/OnboardingSubsection.tsx';

export default function PersonalInfo({ data, updateData }: OnboardingSubsection) {  

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        {/* put in backend logic later */}
    }

    return (
        <div className="pi-div">
            <form onSubmit={handleSubmit}>
                <Question question={"Full Name"} input_type={"text"} 
                value={data.fullName} onChange={(v) => updateData({ fullName: v})} 
                direction={"This will be the primary name used for communications."}/>

                <Question question={"Work Email"} input_type={"email"} 
                value={data.workEmail} onChange={(v) => updateData({ workEmail: v})} 
                direction={"Enter your work email."} />

                <Question question={"Job Title"} input_type={"text"} 
                value={data.jobTitle} onChange={(v) => updateData({ jobTitle: v})} 
                direction={"Enter your position as a supervisor."} />

            </form>
        </div>
    );
}