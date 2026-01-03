import { useState, useEffect } from 'react';
import Question from '../../Question/Question.tsx'

export default function AccountPreferences_Onboarding() {
    const [displayName, setDisplayName] = useState("");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [notificationPreference, setNotificationPreference] = useState<string[]>([]);

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    useEffect(() => {
        if (!profilePicture) {
            setImagePreview(null);
            return;
        }
        const url = URL.createObjectURL(profilePicture);
        setImagePreview(url);

        return () => URL.revokeObjectURL(url);
    }, [profilePicture]);


    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        {/* put in backend logic later */}
    }

    return (
        <div className="ap-o-div">
            <form onSubmit={handleSubmit}>
                
                <Question question={"Display Name"} input_type={"text"} 
                value={displayName} onChange={setDisplayName} 
                direction={"This will be the display name on your profile."}/>
                
                <Question question={"Profile Picture"} input_type={"file"} 
                value={imagePreview} onChange={setProfilePicture} 
                direction={"You may change your profile picture now if you wish."}
                meta={"pfp"}/>

                <Question question={"Notification Preference"} input_type={"checkbox"} 
                value={notificationPreference} onChange={setNotificationPreference} 
                direction={"Select all that apply."} options={["In-App", "E-mail"]} />

            </form>
        </div>
    );
}