import { useEffect } from 'react';
import Question from '../../Question/Question.tsx';
import type { OnboardingSubsection } from '../../../../../types/OnboardingSubsection.tsx';

export default function TrainingMaterials({ data, updateData, registerFormId, onNext }: OnboardingSubsection) {
    const formId = "training-materials-form";

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
        <div className="tm-div">
            <form id={formId} onSubmit={handleSubmit}>

                <Question question={"Upload Training Materials"} input_type={"file"} 
                value={data.uploadedPDF} onChange={(v) => updateData({ uploadedPDF: v})} meta={"pdf"}
                direction={"Upload any PDFs relevant to your store's compliance policies and protocols."}/>

            </form>
        </div>
    );
}