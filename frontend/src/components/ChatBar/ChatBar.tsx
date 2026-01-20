import './ChatBar.css';
import AttachmentItem from '../AttachmentItem/AttachmentItem';
import paperclip_icon from '../../assets/icons/chatbar/paperclip-icon.svg';
import voice_icon from '../../assets/icons/chatbar/voice-msg-icon.svg';
import send_icon from '../../assets/icons/chatbar/send-icon.svg';

type ChatBarProps = {
    context: "builder" | "module" | "simulation";
    userInput: string;
    setUserInput: (userInput: string) => void;
    handleSend: () => void;
    handleAttach?: () => void;
    attachedFiles?: string[]; // change to File[] later
    showFileCond?: boolean;
    handleRemoveFile?: (fileName: string) => void;
    handleVoiceMode?: () => void;
};

export default function ChatBar({ context, userInput, setUserInput, handleSend, handleAttach, attachedFiles, showFileCond, handleRemoveFile, handleVoiceMode }: ChatBarProps) {
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUserInput(e.target.value);
      
        const el = e.target;
        el.style.height = "auto"; 
        el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
    };
    const contextToPlaceholder = {
        "builder": "Describe your idea",
        "module": "Tell Cognition AI what to adjust",
        "simulation": "Enter your response"
    };
      

    return (
        <div className="chat-bar-wrapper">
            { (showFileCond && (attachedFiles?.length ?? 0) > 0) &&
                <div className="attached-items-wrapper">
                    {attachedFiles?.map((f) => <AttachmentItem fileName={f} onClick={() => handleRemoveFile?.(f)} />)}
                </div>
            }
            <div className={`chat-bar-input ${(showFileCond && (attachedFiles?.length ?? 0)) ? "expanded" : ""}`}>
                <textarea placeholder={contextToPlaceholder[context]} value={userInput} onChange={(e) => {setUserInput(e.target.value); handleTextareaChange(e);}} />
                <span className="send-icon" onClick={handleSend}>
                    <img src={send_icon} />
                </span>
            </div>
            <div className="chat-actions-wrapper">
                <div className="chat-actions">
                    {(context === "builder") &&
                    <>
                        <div className="chat-action" onClick={handleAttach}>
                            <span className="chat-action-icon">
                                <img src={paperclip_icon} />
                            </span>
                            Choose Reference Material
                        </div>
                        <div className="chat-action-divider" />
                    </>
                    }
                    <div className="chat-action" onClick={handleVoiceMode}>
                        <span className="chat-action-icon">
                            <img src={voice_icon} />
                        </span>
                        Voice Message
                    </div>
                </div>
            </div>
        </div>
    );
}