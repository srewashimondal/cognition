import './PersonalInfo.css';
import { useEffect } from 'react';
import Question from '../../Question/Question.tsx'
import type { OnboardingSubsection } from '../../../../../types/Onboarding/OnboardingSubsection.tsx';

export default function PersonalInfo({ data, updateData, registerFormId, onNext }: OnboardingSubsection) {  
    const formId = "personal-info-form";

    useEffect(() => {
        registerFormId(formId);
        return () => registerFormId(""); 
    }, []);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        onNext();
        {/* put in backend logic later */}
    }

    return (
        <div className="pi-div">
            <form id={formId} onSubmit={handleSubmit}>
                <Question question={"Full Name*"} input_type={"text"} 
                value={data.fullName} onChange={(v) => updateData({ fullName: v})} 
                direction={"This will be the primary name used for communications."}
                required={true}/>

                <Question question={"Work Email*"} input_type={"email"} 
                value={data.workEmail} onChange={(v) => updateData({ workEmail: v})} 
                direction={"Enter your work email."} required={true} />

                <Question question={"Job Title*"} input_type={"text"} 
                value={data.jobTitle} onChange={(v) => updateData({ jobTitle: v})} 
                direction={"Enter your position as a supervisor."} required={true} />

            </form>
        </div>
    );
}