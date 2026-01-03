import { useState } from 'react';
import Question from '../../Question/Question';

export default function TeamDetails() {
    const [numEmployees, setNumEmployees] = useState<[number, number]>([0, 100]);
    const [expLevel, setExpLevel] = useState("");
    const [challenge, setChallenge] = useState<string[]>([]);

    return (
        <div className="td-div">

            <Question question={"Team Size"} input_type={"range"} 
            value={numEmployees} onChange={setNumEmployees} 
            direction={"Select a range."}/>

            <Question question={"Average Experience Level"} input_type={"radio"} 
            value={expLevel} onChange={setExpLevel} options={["Mostly first-time workers", "Mostly experienced staff", "Mixed experience"]}
            direction={"Select an option."}/>

            <Question question={"Primary Onboarding Challenges"} input_type={"checkbox"} 
            value={challenge} onChange={setChallenge} 
            options={["Product Knowledge", "Store Navigation", "Customer Service", "Confidence Under Pressure"]}
            direction={"Select all that apply."}/>

        </div>
    );
}