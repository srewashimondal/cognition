import { useEffect } from 'react';
import Question from '../../EmployerDashBoard/Onboarding/Question/Question';
import type { EmployeeOnboardingSection } from '../../../types/Onboarding/OnboardingSection';
import type { EmployeeOnboardingSubsection } from '../../../types/Onboarding/OnboardingSubsection';

export default function LearningSetup({ substep, data, updateData, registerFormId, onNext }: EmployeeOnboardingSection) {
    return (
        <div className="ps-div">
            {(substep === 0) && <RoleInfo data={data} updateData={updateData} registerFormId={registerFormId} onNext={onNext}/>}
            {(substep === 1) && <LearningPreferences data={data} updateData={updateData} registerFormId={registerFormId} onNext={onNext}/>}
        </div>
    );
}

function RoleInfo({ data, updateData, registerFormId, onNext }: EmployeeOnboardingSubsection) {
    const formId = "role-info-form";

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

                <Question question={"What best describes your confidence in day-to-day work?"} input_type={"select"} 
                value={data.confidence} onChange={(v) => updateData({ confidence: v})} 
                direction={"Select an option."}
                options={["Still learning", "Getting there", "Fairly confident", "Very confident"]} />

                <Question question={"How often do you have customer interaction?"} input_type={"select"} 
                value={data.customerInteraction} onChange={(v) => updateData({ customerInteraction: v})} 
                direction={"Select an option."}
                options={["Low", "Moderate", "High"]} />

            </form>
        </div>
    );
}

function LearningPreferences({ data, updateData, registerFormId, onNext }: EmployeeOnboardingSubsection) {
    const formId = "learning-preferences-form";

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

                <Question question={"Cognition is safe for ADHD users."} input_type={"switch"} 
                value={data.haveADHD} onChange={(v) => updateData({ haveADHD: v})} 
                placeholder={"Enable ADHD Focus"}/>

                <Question question={"How do you learn best?"} input_type={"checkbox"} 
                value={data.learningPreference} onChange={(v) => updateData({ learningPreference: v})} 
                direction={"Select all that apply."} options={["Watching", "Practicing", "Reading"]} />

                <Question question={"What would you like to improve your confidence in?"} input_type={"checkbox"} 
                value={data.improvements} onChange={(v) => updateData({ improvements: v})} 
                direction={"Select all that apply."} options={["Talking to customers", "Handling tough situations", "Product knowledge", "Speed & Accuracy"]} />

            </form>
        </div>
    );
}