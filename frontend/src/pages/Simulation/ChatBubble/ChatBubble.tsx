import './ChatBubble.css';
import type { MessageType } from '../../../types/Modules/Lessons/Simulations/MessageType';

export default function ChatBubble({ role, content, name }: MessageType) {
    return (
        <div className={`chat-bubble-wrapper ${role}`}>
            {(role === "assistant") ? (<div className="msg-content"></div>) :
                (<div className={`chat-bubble ${role}`}>
                    <span className="role-text">{(role === "user") ? "You" : name}</span>
                    <span className="content-text">{content}</span>
                </div>)
            }
        </div>
    );
}