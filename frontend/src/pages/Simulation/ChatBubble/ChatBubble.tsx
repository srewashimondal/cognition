import './ChatBubble.css';
import TypingMessage from '../../../components/TypingMessage/TypingMessage';
import type { MessageType } from '../../../types/Modules/Lessons/Simulations/MessageType';

type ChatBubbleProps = {
    message: MessageType;
    className?: string;
    handleClick?: () => void;
};

export default function ChatBubble({ message, className, handleClick }: ChatBubbleProps) {
    const { role, name, content } = message;
      
    return (
        <div className={`chat-bubble-wrapper ${role} ${className ?? ""} `}>
            <span className="role-text">{(role === "user") ? "You" : (role === "assistant") ? "Cognition" : name}</span>
            <div className={`chat-bubble ${role}`} onClick={() => {if (role === "user") {handleClick?.();}}}>
                <span className="content-text">{content}</span>
            </div>
        </div>
    );
}