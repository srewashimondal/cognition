import './ChatBubble.css';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TypingMessage from '../../../components/TypingMessage/TypingMessage';
import type { MessageType } from '../../../types/Modules/Lessons/Simulations/MessageType';
import regen_icon from '../../../assets/icons/simulations/grey-refresh-icon.svg';

type ChatBubbleProps = {
    message: MessageType;
    className?: string;
    handleClick?: () => void;
    shouldType?: boolean;
    stopTyping?: boolean;
    onTypingComplete?: () => void;
    shouldRegenerate?: boolean;
    handleRegenerate?: () => void;
    onTypingUpdate?: () => void;
};

export default function ChatBubble({ message, className, handleClick, shouldType, stopTyping, onTypingComplete, shouldRegenerate, handleRegenerate, onTypingUpdate }: ChatBubbleProps) {
    const { role, name, content } = message;
    const cleanedContent = content.replace(/\n{3,}/g, "\n\n");
      
    return (
        <div className={`chat-bubble-wrapper ${role} ${className ?? ""} `}>
            <span className="role-text">{(role === "user") ? "You" : (role === "assistant") ? "Cognition" : name}</span>
            <div className={`chat-bubble ${role}`} onClick={() => {if (role === "user") {handleClick?.();}}}>
                <div className="content-text">
                    { role === "assistant" && shouldType ?
                        <TypingMessage text={content} shouldStop={stopTyping} onComplete={onTypingComplete} onUpdate={onTypingUpdate}/> : 
                        <ReactMarkdown remarkPlugins={[remarkGfm]}> 
                            {cleanedContent}
                        </ReactMarkdown>
                    }
                </div>
            </div>
            {role === "assistant" && className === "last-message" && shouldRegenerate &&
            <div className="regenerate-btn" onClick={() => handleRegenerate?.()}>
                <img src={regen_icon} />
            </div>}
        </div>
    );
}