import './BuilderCanvas.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AttachmentItem from '../../../../components/AttachmentItem/AttachmentItem';
import ActionButton from '../../../../components/ActionButton/ActionButton';
import LessonCard from '../../../../cards/LessonCard/LessonCard';
import ChatBar from '../../../../components/ChatBar/ChatBar';
import { modules } from '../../../../dummy_data/modules_data';
import orange_left_arrow from '../../../../assets/icons/orange-left-arrow.svg';
import edit_icon from '../../../../assets/icons/simulations/grey-edit-icon.svg';
import refresh_icon from '../../../../assets/icons/simulations/grey-refresh-icon.svg';
import check_icon from '../../../../assets/icons/simulations/grey-check-icon.svg';
import clock_icon from '../../../../assets/icons/simulations/black-clock-icon.svg';
import face_icon from '../../../../assets/icons/simulations/black-face-icon.svg';
import folder_icon from '../../../../assets/icons/simulations/black-folder-icon.svg';
import cap_icon from '../../../../assets/icons/simulations/black-cap-icon.svg';
import plus_icon from '../../../../assets/icons/simulations/black-plus-icon.svg';
import x_icon from '../../../../assets/icons/simulations/grey-x-icon.svg';
import note_icon from '../../../../assets/icons/orange-note-icon.svg';
import ai_icon from '../../../../assets/icons/simulations/orange-ai-icon.svg';

type BuilderCanvasProps = {
    id: string;
};

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

export default function BuilderCanvas({ id }: BuilderCanvasProps) {
    const navigate = useNavigate();
    const moduleId = Number(id);

    /* replace this line with backend logic later */
    const module = modules.find(m => m.id === moduleId);
    const lessons = module?.lessons;

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

    const [editMode, setEditMode] = useState(false);
    const [references, setReferences] = useState<string[] | undefined>(module?.references); // change to File[]
    const [openModal, setOpenModal] = useState(false);
    const [tempAttach, setTempAttach] = useState<string[]>([]); // change to File[]
    const [title, SetTitle] = useState(module?.title);
    const [userInput, setUserInput] = useState("");
    const [showChatBar, setShowChatBar] = useState(false);

    const handleRemoveReference = (fileToRemove: string) => { // change to File
        setReferences(prev => prev?.filter(item => item !== fileToRemove));
    };

    const handleAttachTemp = (fileToAttach: string) => { // change to File later
        setTempAttach(prev =>
            prev?.includes(fileToAttach)
            ? prev.filter(item => item !== fileToAttach)
            : [...(prev ?? []), fileToAttach]                     
        );
        setReferences(prev =>
            prev?.includes(fileToAttach)
            ? prev.filter(item => item !== fileToAttach)
            : prev ?? []                
        );
    };

    const handleAttach = (filesToAttach: string[]) => { // change to File[]
        setOpenModal(false);
        setReferences(prev => [...(prev ?? []), ...filesToAttach]);
    }

    const handleDeploy = () => {
        /* Nothing for now */
    };

    const handleSave = () => {
        /* Nothing for now */
    };

    const handleSend = () => {
        /* Nothing for now */
    };

    return (
        <div className="builder-canvas-page">
            {(openModal) && <div className="attach-overlay">
                    <div className="attach-modal">
                        <div className="x-icon-wrapper">
                            Select Documents to Attach
                            <div className="x-icon" onClick={() => setOpenModal(false)}>
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
                                    <button className={`attach-btn ${(references?.includes(item) || tempAttach.includes(item)) ? "attached" : ""}`} onClick={() => handleAttachTemp(item)}>
                                        {(references?.includes(item) || tempAttach.includes(item)) ? "Attached" : "Attach"}
                                    </button>
                                    </li>
                                ))}
                                </ul>
                            </div>
                            ))}
                        </div>
                        <div className="attach-action-panel">
                            <ActionButton text="Attach Documents" buttonType="attach"
                            onClick={() => handleAttach(tempAttach)} />
                        </div>
                    </div>
                </div>}
            <div className="back-to-modules" onClick={() => navigate(`/employer/modules`)}>
                <img src={orange_left_arrow} />
            </div>
            {/*<div className="green-pill">
                    <span>
                        <img src={info_icon} />
                    </span>
                    Generated Module
            </div>*/}
            <div className="modules-header lesson-pg">
                {editMode ? 
                    <div className="title-input-wrapper">
                        <span className="edit-mode-icon">
                            <img src={edit_icon} />
                        </span>
                        <div className="title-input">
                            <input type="text" placeholder="Enter new title" value={title} onChange={(e) => SetTitle(e.target.value)} />
                        </div>
                    </div>
                : <h1>{title}</h1>}
                <div className="global-action-panel">
                    <div className="builder-action" onClick={() => setEditMode(prev => !prev)}>
                        <img src={editMode ? check_icon : edit_icon} />
                    </div>
                    <div className="builder-action">
                        <img src={refresh_icon} />
                    </div>
                </div>
            </div>
            <div className="module-info-builder">
                <div className="module-info-line">
                    <div className="module-info-left">
                    <span className="module-info-icon">
                        <img src={clock_icon} />
                    </span>
                    <span className="module-info-label">Created</span>
                    </div>
                    <p className="module-info-value">{module?.createTime}</p>
                </div>

                <div className="module-info-line">
                    <div className="module-info-left">
                    <span className="module-info-icon">
                        <img src={face_icon} />
                    </span>
                    <span className="module-info-label">Difficulty</span>
                    </div>
                    <p className="module-info-value">{module?.difficulty}</p> {/*lets say this is calculated by lesson info*/}
                </div>

                <div className="module-info-line">
                    <div className="module-info-left">
                    <span className="module-info-icon">
                        <img src={folder_icon} />
                    </span>
                    <span className="module-info-label">References</span>
                    </div>
                </div>
            </div>
            <div className="attached-references-wrapper">
                <div className="attached-references" >
                    {references?.map((f) => <AttachmentItem fileName={f} onClick={() => handleRemoveReference(f)} />)}
                    <div className="plus-wrapper">
                        <div className="builder-action" onClick={() => setOpenModal(true)}>
                            <img src={plus_icon} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="module-info-line lesson">
                <div className="module-info-left">
                <span className="module-info-icon">
                    <img src={cap_icon} />
                </span>
                <span className="module-info-label">Lessons</span>
                </div>
            </div>
            <div className="lessons-list">
                {lessons?.map((l) => (<LessonCard lessonInfo={l} role={"employer"} moduleID={moduleId} />))}
            </div>
            <div className="builder-action-panel">
                <ActionButton text={"Save as Draft"} buttonType={"save"} onClick={handleSave} reversed={true} />
                <ActionButton text={"Deploy"} buttonType={"deploy"} onClick={handleDeploy} disabled={module?.deployed} />
            </div>
            <div className="builder-chat-wrapper">
                { (showChatBar) ?
                <ChatBar context={"module"} userInput={userInput} setUserInput={setUserInput} 
                handleSend={handleSend} pageContext={["Module Base", ...(lessons ?? [])]}/>
                : <div className="show-chatbar-toggle" onClick={() => setShowChatBar(prev => !prev)}>
                    <img src={ai_icon} />
                </div>
                }
            </div>
            <div className="filler-space" />
        </div>
    );
}