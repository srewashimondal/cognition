import { useEffect } from 'react';
import Question from '../../Question/Question';
import type { OnboardingSubsection } from '../../../../../types/Onboarding/OnboardingSubsection';

export default function StoreLayout({ data, updateData, registerFormId, onNext }: OnboardingSubsection) {
    const formId = "store-layout-form";

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
        <div className="sl-div">
            <form id={formId} onSubmit={handleSubmit}>

                <Question question={"Upload Store MAP"} input_type={"file"} 
                value={data.map} onChange={(v) => updateData({ map: v})} meta={"map"}
                direction={"Only PDF, JPEG/JPG, PNG, and SVG file types allowed."}/> 
                
                <Question question={"Store Layout Type"} input_type={"select"} 
                value={data.type} onChange={(v) => updateData({ type: v})} options={["Aisles", "Sections", "Rooms", "Mixed"]}
                direction={"Select a layout type."}/> 


            </form>
        </div>
    );
}