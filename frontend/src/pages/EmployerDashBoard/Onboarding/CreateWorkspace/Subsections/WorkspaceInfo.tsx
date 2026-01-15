import { useState, useEffect } from 'react';
import Question from '../../Question/Question.tsx';
import type { OnboardingSubsection } from '../../../../../types/Onboarding/OnboardingSubsection.tsx';

export default function WorkspaceInfo({ data, updateData, registerFormId, onNext }: OnboardingSubsection) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    useEffect(() => {
        if (!data.workspaceIcon) {
            setImagePreview(null);
            return;
        }
        const url = URL.createObjectURL(data.workspaceIcon);
        setImagePreview(url);

        return () => URL.revokeObjectURL(url);
    }, [data.workspaceIcon]);

    const formId = "workspace-info-form";

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
        <div className="wi-div">
            <form id={formId} onSubmit={handleSubmit}>

                <Question question={"Workspace Name*"} input_type={"text"} 
                value={data.workspaceName} onChange={(v) => updateData({ workspaceName: v})} 
                direction={"This will be the name of your Workspace."} required={true} />

                <Question question={"Workspace Icon"} input_type={"file"} 
                value={imagePreview} onChange={(v) => updateData({ workspaceIcon: v})} 
                direction={"You may change the icon of your workspace now if you wish."}
                meta={"pfp"}/>

                <Question question={"Accessibility Preferences"} input_type={"checkbox"} 
                value={data.accessibilityPref} onChange={(v) => updateData({ accessibilityPref: v})} 
                options={["ADHD Focus"]} />

            </form>
        </div>
    );
}