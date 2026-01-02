import './AccountPreferences_Onboarding.css';
import { useState } from 'react';
import Question from '../../Question/Question.tsx'

export default function AccountPreferences_Onboarding() {
    const [displayName, setDisplayName] = useState("");
    /* const [profilePicture, setProfilePicture] = useState("");
    const [notificationPreference, setNotificationPreference] = useState(""); */

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

            </form>
        </div>
    );
}