import './Builder.css';
import { useState } from 'react';
import { Tooltip } from "@radix-ui/themes";
import { useParams, useNavigate } from 'react-router-dom';
import ChatBar from '../../../components/ChatBar/ChatBar';
import ActionButton from '../../../components/ActionButton/ActionButton';
import BuilderCanvas from './BuilderCanvas/BuilderCanvas';
import orange_left_arrow from '../../../assets/icons/orange-left-arrow.svg';
import ai_icon from '../../../assets/icons/simulations/grey-ai-icon.svg';
import x_icon from '../../../assets/icons/simulations/grey-x-icon.svg';
import note_icon from '../../../assets/icons/orange-note-icon.svg';

const resourceSections = [
    {
      title: "Workplace Policies",
      icon: "🏢",
      tone: "policies",
      description: "Company-wide policies all employees must review",
      items: [
        "Sexual Harassment Policy",
        "Code of Conduct",
        "Equal Opportunity Policy",
        "Photo & Media Consent Waiver",
      ],
    },
    {
      title: "HR & Forms",
      icon: "🧾",
      tone: "hr",
      description: "Forms for requests, documentation, and approvals",
      items: [
        "Request for Time Off",
        "Doctor’s Excusal Form",
        "Employee Information Update Form",
        "Incident Report Form",
      ],
    },
    {
      title: "Training & Operations",
      icon: "🎓",
      tone: "training",
      description: "Guidelines to support daily retail operations",
      items: [
        "Employee Handbook",
        "Store Training Standards",
        "Customer Service Guidelines",
        "POS & Inventory Procedures",
      ],
    },
    {
      title: "Safety & Compliance",
      icon: "🛡️",
      tone: "safety",
      description: "Safety instructions and emergency information",
      items: [
        "Workplace Safety Guidelines",
        "Emergency Evacuation Plan",
        "Health & Sanitation Protocols",
        "Labor Law Notices",
      ],
    },
];

export default function Builder() {
    const navigate = useNavigate();
    const { moduleID } = useParams();
    const isNewDraft = !moduleID;
    const [openModal, setOpenModal] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [attachedFiles, setAttachedFiles] = useState<string[]>([]); // change to File[] later
    const [voiceMode, setVoiceMode] = useState(false);

    const handleSend = () => {
        /* nothing for now */
    };

    const handleAttach = (fileToAttach: string) => { // change to File later
        setAttachedFiles(prev =>
            prev.includes(fileToAttach)
            ? prev.filter(item => item !== fileToAttach)
            : [...prev, fileToAttach]                     
        );
    };

    const handleRemoveFile = (fileToRemove: string) => { // change to File later
        setAttachedFiles(prev => prev.filter(item => item !== fileToRemove));
    };

    
    return (
        <> { (isNewDraft) ? 
            (<div className="builder-page">
                {(openModal) && <div className="attach-overlay">
                    <div className="attach-modal">
                        <div className="x-icon-wrapper">
                            Select Documents to Attach
                            <div className="x-icon" onClick={() => {setOpenModal(false); setAttachedFiles([]);}}>
                                <img src={x_icon} />
                            </div>
                        </div>
                        <div className="attach-content-wrapper">   
                            {resourceSections.map((section) => (
                            <div
                                key={section.title}
                                className={`resource-card ${section.tone} builder`}
                            >
                                <div className="card-header">
                                <h3>
                                    <span className={`section-icon ${section.tone}`}>
                                    {section.icon}
                                    </span>
                                    {section.title}
                                </h3>
                                <p>{section.description}</p>
                                </div>

                                <ul className="resource-list">
                                {section.items.map((item) => (
                                    <li key={item} className="resource-item">
                                    <span className="doc-icon builder">
                                        <img src={note_icon} />
                                    </span>
                                    <span className="doc-name">{item}</span>
                                    <button className={`attach-btn ${attachedFiles.includes(item) ? "attached" : ""}`} onClick={() => handleAttach(item)}>
                                        {attachedFiles.includes(item) ? "Attached" : "Attach"}
                                    </button>
                                    </li>
                                ))}
                                </ul>
                            </div>
                            ))}
                        </div>
                        <div className="attach-action-panel">
                            <ActionButton text="Attach Documents" buttonType="attach"
                            onClick={() => setOpenModal(false)} />
                        </div>
                    </div>
                </div>}
                <Tooltip content="Go back">
                    <div className="back-to-modules builder" onClick={() => navigate(`/employer/modules`)}>
                        <img src={orange_left_arrow} />
                    </div>
                </Tooltip>
                {(voiceMode) ? 
                <div className="voice-receiver">
                    <div className="voice-circle" /> 
                    You are Speaking
                </div>
                : <div className="builder-hero">
                    <h3>Welcome To</h3>
                    <h3>Builder Studio</h3>
                    <div className="builder-desc">
                        <span>
                            <img src={ai_icon} />
                        </span>
                        <p>Start by pitching a Simulation Idea to Cognition AI</p>
                    </div>
                </div>}
                <div className="chatbar-wrapper">
                    <ChatBar context="builder" userInput={userInput} setUserInput={setUserInput} 
                    handleSend={handleSend} handleAttach={() => setOpenModal(true)}
                    attachedFiles={attachedFiles} showFileCond={!openModal} 
                    handleRemoveFile={handleRemoveFile} 
                    handleVoiceMode={() => setVoiceMode(prev => !prev)} />
                </div>
            </div> ) :
            (
             <BuilderCanvas id={moduleID} />
            )
        } </>
    );
}