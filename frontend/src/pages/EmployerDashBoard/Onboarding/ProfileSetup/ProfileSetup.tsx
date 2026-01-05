import PersonalInfo from './Subsections/PersonalInfo.tsx';
import AccountPreferences_Onboarding from './Subsections/AccountPreferences_Onboarding.tsx';
import type { OnboardingSection } from '../../../../types/OnboardingSection.tsx';

export default function ProfileSetup({ substep, data, updateData, registerFormId, onNext }: OnboardingSection) {
    return (
        <div className="ps-div">
            {(substep === 0) && <PersonalInfo data={data} updateData={updateData} registerFormId={registerFormId} onNext={onNext} />}
            {(substep === 1) && <AccountPreferences_Onboarding data={data} updateData={updateData} registerFormId={registerFormId} onNext={onNext}/>}
        </div>
    );
}