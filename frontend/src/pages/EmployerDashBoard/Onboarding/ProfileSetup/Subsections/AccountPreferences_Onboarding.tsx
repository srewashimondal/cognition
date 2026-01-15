import { useState, useEffect } from 'react';
import Question from '../../Question/Question.tsx'
import type { OnboardingSubsection } from '../../../../../types/Onboarding/OnboardingSubsection.tsx';


export default function AccountPreferences_Onboarding({ data, updateData, registerFormId, onNext }: OnboardingSubsection) {
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