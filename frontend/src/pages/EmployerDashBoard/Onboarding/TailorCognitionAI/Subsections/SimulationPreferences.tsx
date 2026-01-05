import { useEffect } from 'react';
import Question from '../../Question/Question';
import type { OnboardingSubsection } from '../../../../../types/OnboardingSubsection';

export default function SimulationPreferences({ data, updateData, registerFormId, onNext }: OnboardingSubsection) {
    const formId = "simulation-preferences-form";

    useEffect(() => {
        registerFormId(formId);
        return () => registerFormId(""); 
    }, []);
    
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        onNext();
        console.log({
            fullName: data.fullName,
            workEmail: data.workEmail,
            jobTitle: data.jobTitle,
            displayName: data.displayName,
            profilePicture: data.profilePicture,
            notificationPreference: data.notificationPreference,
            workspaceName: data.workspaceName,
            workspaceIcon: data.workspaceIcon,
            accessibilityPref: data.accessibilityPref,
            storeName: data.storeName,
            retailCategory: data.retailCategory,
            storeFormat: data.storeFormat,
            numEmployees: data.numEmployees,
            expLevel: data.expLevel,
            challenge: data.challenge,
            uploadedPDF: data.uploadedPDF,
            posProvider: data.posProvider,
            selectedSettings: data.selectedSettings,
            map: data.map,
            type: data.type,
            scenTypes: data.scenTypes,
            difficultyLevel: data.difficultyLevel,
          });
        {/* put in backend logic later */}
    }

    return (
        <div className="sp-div">
            <form id={formId} onSubmit={handleSubmit}>

                <Question question={"Select preferred scenario types"} input_type={"checkbox"} 
                value={data.scenTypes} onChange={(v) => updateData({ scenTypes: v})} options={["Everyday customer interactions", "Emergency Situations"]} />

                <Question question={"Select a difficulty level"} input_type={"select"} 
                value={data.difficultyLevel} onChange={(v) => updateData({ difficultyLevel: v})} options={["Beginner", "Intermediate", "Advanced"]}/>

            </form>
        </div>
    );
}