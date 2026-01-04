import { useState } from 'react';
import Question from '../../Question/Question';

export default function StoreLayout() {
    const [map, setMap] = useState<File | null>(null);
    const [type, setType] = useState("Aisles");

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        {/* put in backend logic later */}
    }

    return (
        <div className="sl-div">
            <form onSubmit={handleSubmit}>

            <Question question={"Upload Store MAP"} input_type={"file"} 
            value={map} onChange={setMap} meta={"map"}
            direction={"This will be the working store map Cognition AI references from."}/> 
            
            <Question question={"Store Layout Type"} input_type={"select"} 
            value={type} onChange={setType} options={["Aisles", "Sections", "Rooms", "Mixed"]}
            direction={"Select a layout type."}/> 


            </form>
        </div>
    );
}