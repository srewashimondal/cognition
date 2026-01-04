import { useState } from 'react';
import Question from '../../Question/Question.tsx';

export default function TrainingMaterials() {
    const [uploadedPDF, setUploadedPDF] = useState<File[]>([]);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        {/* put in backend logic later */}
    }

    return (
        <div className="tm-div">
            <form onSubmit={handleSubmit}>

                <Question question={"Upload Training Materials"} input_type={"file"} 
                value={uploadedPDF} onChange={setUploadedPDF} meta={"pdf"}
                direction={"Upload any PDFs relevant to your store's compliance policies and protocols."}/>

            </form>
        </div>
    );
}