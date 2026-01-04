import PersonalInfo from './Subsections/PersonalInfo.tsx';
import AccountPreferences_Onboarding from './Subsections/AccountPreferences_Onboarding.tsx';
import type { OnboardingSection } from '../../../../types/OnboardingSection.tsx';

export default function ProfileSetup({ substep, data, updateData }: OnboardingSection) {
    return (
        <div className="ps-div">
            {(substep === 0) && <PersonalInfo data={data} updateData={updateData}/>}
            {(substep === 1) && <AccountPreferences_Onboarding data={data} updateData={updateData}/>}
        </div>
    );
}