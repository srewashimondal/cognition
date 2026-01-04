import Question from '../../Question/Question';
import type { OnboardingSubsection } from '../../../../../types/OnboardingSubsection';

export default function StoreLayout({ data, updateData }: OnboardingSubsection) {
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        {/* put in backend logic later */}
    }

    return (
        <div className="sl-div">
            <form onSubmit={handleSubmit}>

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