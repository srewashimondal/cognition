import { useState, useEffect } from 'react';
import Question from '../../EmployerDashBoard/Onboarding/Question/Question';
import type { EmployeeOnboardingSection } from '../../../types/Onboarding/OnboardingSection';
import type { EmployeeOnboardingSubsection } from '../../../types/Onboarding/OnboardingSubsection';

export default function ProfileSetup({ substep, data, updateData, registerFormId, onNext }: EmployeeOnboardingSection) {
    return (
        <div className="ps-div">
            {(substep === 0) && <PersonalInfo data={data} updateData={updateData} registerFormId={registerFormId} onNext={onNext}/>}
            {(substep === 1) && <AccountPreferences data={data} updateData={updateData} registerFormId={registerFormId} onNext={onNext}/>}
        </div>
    );
}

function PersonalInfo({ data, updateData, registerFormId, onNext }: EmployeeOnboardingSubsection) {
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

                <Question question={"Job Title*"} input_type={"checkbox"} 
                value={data.jobTitle} onChange={(v) => updateData({ jobTitle: v})} 
                direction={"Select all that apply."} options={["Sales Associate", "Cashier"]} />
            </form>
        </div>
    );
}

function AccountPreferences({ data, updateData, registerFormId, onNext }: EmployeeOnboardingSubsection) {
    const formId = "account-preferences-form";

    useEffect(() => {
        registerFormId(formId);
        return () => registerFormId(""); 
    }, []);

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    useEffect(() => {
        if (!data.profilePicture) {
            setImagePreview(null);
            return;
        }
        const url = URL.createObjectURL(data.profilePicture);
        setImagePreview(url);

        return () => URL.revokeObjectURL(url);
    }, [data.profilePicture]);


    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        {/* put in backend logic later */}
        onNext();
    }

    return (
        <div className="ap-o-div">
            <form id={formId} onSubmit={handleSubmit}>

                <Question question={"Display Name"} input_type={"text"} 
                value={data.displayName} onChange={(v) => updateData({ displayName: v})} 
                direction={"This will be the display name on your profile."}/>
                
                <Question question={"Profile Picture"} input_type={"file"} 
                value={imagePreview} onChange={(v) => updateData({ profilePicture: v})} 
                direction={"You may change your profile picture now if you wish."}
                meta={"pfp"}/>

                <Question question={"Notification Preference"} input_type={"checkbox"} 
                value={data.notificationPreference} onChange={(v) => updateData({ notificationPreference: v})} 
                direction={"Select all that apply."} options={["In-App", "E-mail"]} />

            </form>
        </div>
    );
}