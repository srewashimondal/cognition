import { useEffect } from 'react';
import Question from '../../Question/Question';
import type { OnboardingSubsection } from '../../../../../types/OnboardingSubsection';

export default function StoreInfo({ data, updateData, registerFormId, onNext }: OnboardingSubsection) {
    const formId = "store-info-form";

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
        <div className="si-div">
            <form id={formId} onSubmit={handleSubmit}>

                <Question question={"Store Name"} input_type={"text"} 
                value={data.storeName} onChange={(v) => updateData({ storeName: v})} 
                direction={"Enter the name of your store/corporation."}/>

                <Question question={"Retail Category"} input_type={"select"} 
                value={data.retailCategory} onChange={(v) => updateData({ retailCategory: v})} 
                direction={"Select an option."}
                options={["Beauty & Cosmetics", "Drugstore & Pharmacy", 
                "General Retail", "Electronics & Tech", "Apparel & Fashion", "Specialty Retail", "Home Goods", "Grocery", "Sporting Goods & Hobbies"]}/>

                <Question question={"Store Format"} input_type={"radio"} 
                value={data.storeFormat} onChange={(v) => updateData({ storeFormat: v})} 
                direction={"Select an option."}
                options={["Standalone Store", "Mall Location", "Department Store Section"]}/>

            </form>
        </div>
    );
}