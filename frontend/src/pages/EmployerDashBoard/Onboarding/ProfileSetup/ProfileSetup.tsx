import './ProfileSetup.css';
import PersonalInfo from './PersonalInfo/PersonalInfo.tsx';
import AccountPreferences_Onboarding from './AccountPreferences/AccountPreferences_Onboarding.tsx';

type ProfileSetupProps = {
    substep: number;
}

export default function ProfileSetup({ substep }: ProfileSetupProps) {
    return (
        <div className="ps-div">
            {(substep === 0) && <PersonalInfo />}
            {(substep === 1) && <AccountPreferences_Onboarding />}
        </div>
    );
}