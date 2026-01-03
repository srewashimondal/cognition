import { useState } from 'react';
import Question from '../../Question/Question';

export default function StoreInfo() {
    const [storeName, setStoreName] = useState("");
    const [retailCategory, setRetailCategory] = useState("Beauty & Cosmetics");
    const [storeFormat, setStoreFormat] = useState("");


    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        {/* put in backend logic later */}
    }

    return (
        <div className="si-div">
            <form onSubmit={handleSubmit}>

                <Question question={"Store Name"} input_type={"text"} 
                value={storeName} onChange={setStoreName} 
                direction={"Enter the name of your store/corporation."}/>

                <Question question={"Retail Category"} input_type={"select"} 
                value={retailCategory} onChange={setRetailCategory} 
                direction={"Select an option."}
                options={["Beauty & Cosmetics", "Drugstore & Pharmacy", 
                "General Retail", "Electronics & Tech", "Apparel & Fashion", "Specialty Retail", "Home Goods", "Grocery", "Sporting Goods & Hobbies"]}/>

                <Question question={"Store Format"} input_type={"radio"} 
                value={storeFormat} onChange={setStoreFormat} 
                direction={"Select an option."}
                options={["Standalone Store", "Mall Location", "Department Store Section"]}/>

            </form>
        </div>
    );
}