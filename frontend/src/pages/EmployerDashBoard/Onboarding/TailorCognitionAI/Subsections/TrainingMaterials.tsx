import Question from '../../Question/Question.tsx';
import type { OnboardingSubsection } from '../../../../../types/OnboardingSubsection.tsx';

export default function TrainingMaterials({ data, updateData }: OnboardingSubsection) {
 
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        {/* put in backend logic later */}
    }

    return (
        <div className="tm-div">
            <form onSubmit={handleSubmit}>

                <Question question={"Upload Training Materials"} input_type={"file"} 
                value={data.uploadedPDF} onChange={(v) => updateData({ uploadedPDF: v})} meta={"pdf"}
                direction={"Upload any PDFs relevant to your store's compliance policies and protocols."}/>

            </form>
        </div>
    );
}