import './AIStudio.css';
import { useState } from 'react';
import Question from '../Onboarding/Question/Question';
import UploadDropzone from '../../../components/UploadDropzone/UploadDropzone';
import ActionButton from '../../../components/ActionButton/ActionButton';
import lightspeed_logo from '../../../assets/illustrations/lightspeed_logo.svg';
import zoho_logo from '../../../assets/illustrations/zoho_logo.png';

export default function AIStudio() {
    const [files, setFiles] = useState<File[]>([]);
    const [maps, setMaps] = useState<File[]>([]);
    const [fileToDelete, setFileToDelete] = useState<File | null>(null);
    const [posProvider, setPOSProvider] = useState("");
    const [selectedSettings, setSelectedSettings] = useState<string[]>(["Sync Inventory", "Sync Products"]);
    const [changesMade, setChangesMade] = useState(false);

    const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/svg+xml",
    ];

    const handleChange = () => {
        setChangesMade(true);
    }

    const handleDelete = (file: File) => {
        setFileToDelete(file);
    };

    const confirmDelete = () => {
        if (!fileToDelete) return;
    
        setFiles(prev =>
          prev.filter(f => f !== fileToDelete)
        );

        setMaps(prev =>
            prev.filter(f => f !== fileToDelete)
        );
        
        setFileToDelete(null);
        setChangesMade(true);
    };

    const handleSave = () => {
        setChangesMade(false);
    };

  return (
    <div className="ai-studio-page">
        {(fileToDelete) && <div className="delete-modal-overlay">
            <div className="delete-modal">
                <h3>Are you sure you want to delete this file?</h3>
                <p>{fileToDelete.name}</p>
                <div className="delete-modal-actions">
                    <button className="cancel-btn" onClick={() => setFileToDelete(null)}>
                        Cancel
                    </button>
                    <button className="delete-btn" onClick={confirmDelete}>Delete</button>
                </div>
            </div>
        </div>
        }
      <div className="modules-header">
        <div>
            <h1>AI Studio</h1>
            <p>Refine Cognition AI to your store's ideals</p>
        </div>
      </div>

      <div className="ai-studio-contents">
        <form id="ai-studio-form">
            <div className="ai-studio-section ai-studio-upload-pdf">
                <div className="ai-studio-prompt-header">
                    <p className="ai-studio-prompt">Upload Training Materials</p>
                    <p className="ai-studio-direction">Accepted File Type: PDF</p>
                    <div className="upload-area">
                        <UploadDropzone amount="multiple" files={files} 
                        setFiles={setFiles} onDelete={handleDelete}
                        handleChange={handleChange} />
                    </div>
                </div>
            </div>
            <div className="ai-studio-section ai-studio-upload-map">
                <div className="ai-studio-prompt-header">
                    <p className="ai-studio-prompt">Upload Store Map Layout</p>
                    <p className="ai-studio-direction">Accepted File Types: PDF, JPEG/JPG, PNG, SVG</p>
                    <div className="upload-area">
                        <UploadDropzone amount="single" files={maps} 
                        allowedTypes={allowedTypes} setFiles={setMaps} 
                        onDelete={handleDelete} handleChange={handleChange}/>
                    </div>
                </div>
            </div>
                <div className="ai-studio-section ai-studio-pos-integration">
                    <Question question={"Select your Point of Scale System Provider"} input_type={"image-buttons"} 
                    value={posProvider} onChange={(newProvider) => {handleChange(); setPOSProvider(newProvider);}} 
                    options={["Lightspeed", "Zoho"]} fileOptions={[lightspeed_logo, zoho_logo]}
                    direction={"Select an option."} />

                    <div className="connect-div ai-studio">
                        <button>Connect</button>
                    </div>

                    <Question question={"Advanced Settings"} input_type={"checkbox"} 
                    value={selectedSettings} onChange={(newSettings) => {handleChange(); setSelectedSettings(newSettings);}} 
                    options={["Sync Inventory", "Sync Products", "Sync Employees", "Auto-sync Employees"]} />
                </div>
                <div className="ai-studio-save-changes">
                    <ActionButton text={"Save Changes"} buttonType={"save"} onClick={handleSave} selected={changesMade} />
                </div>
            </form>
        </div>
        <div className="filler-space"></div>
    </div>
);
}
