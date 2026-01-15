import './ChatBubble.css';
import type { MessageType } from '../../../types/Modules/Lessons/Simulations/MessageType';

type ChatBubbleProps = MessageType & {
    className?: string;
};

export default function ChatBubble({ role, content, name, className }: ChatBubbleProps) {
    return (
        <div className={`chat-bubble-wrapper ${role} ${className ?? ""}`}>
            {(role === "assistant") ? (<div className="msg-content"></div>) :
                (<div className={`chat-bubble ${role}`}>
                    <span className="role-text">{(role === "user") ? "You" : name}</span>
                    <span className="content-text">{content}</span>
                </div>)
            }
        </div>
    );
}