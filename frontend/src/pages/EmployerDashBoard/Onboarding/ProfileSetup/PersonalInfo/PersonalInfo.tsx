import './PersonalInfo.css';
import { useState } from 'react';
import Question from '../../Question/Question.tsx'

export default function PersonalInfo() {
    const [fullName, setFullName] = useState("");
    const [workEmail, setWorkEmail] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        {/* put in backend logic later */}
    }

    return (
        <div className="pi-div">
            <form onSubmit={handleSubmit}>
                <Question question={"Full Name"} input_type={"text"} 
                value={fullName} onChange={setFullName} 
                direction={"This will be the primary email used for communications."}/>

                <Question question={"Work Email"} input_type={"email"} 
                value={workEmail} onChange={setWorkEmail} 
                direction={"Enter your work email."} />

                <Question question={"Job Title"} input_type={"text"} 
                value={jobTitle} onChange={setJobTitle} 
                direction={"Enter your position as a supervisor."} />

            </form>
        </div>
    );
}