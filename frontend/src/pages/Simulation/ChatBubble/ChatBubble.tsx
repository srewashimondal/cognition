import './ChatBubble.css';
import { useState } from 'react';
import type { MessageType } from '../../../types/Modules/Lessons/Simulations/MessageType';
import reply_icon from '../../../assets/icons/reply-icon.svg';

type ChatBubbleProps = {
    message: MessageType;
    allMessages: MessageType[];
    className?: string;
    handleClick?: () => void;
};

export default function ChatBubble({ message, allMessages, className, handleClick }: ChatBubbleProps) {
    const { role, name, content, rating, replyToId } = message;
    const [expanded, setExpanded] = useState(false);
    const repliedMessage = replyToId ? allMessages.find(m => m.id === replyToId) : null;
    const truncateWords = (text: string, wordLimit: number) => {
        const words = text.split(" ");
        return words.length > wordLimit
          ? words.slice(0, wordLimit).join(" ") + "…"
          : text;
    };
      
    return (
        <div className={`chat-bubble-wrapper ${role} ${className ?? ""} ${expanded ? "expanded": ""}`}>
            {(role === "assistant") ? 
                repliedMessage && (<div className="assistant-msg"> 
                    <div className="reply-preview" onClick={() => setExpanded(prev => !prev)}>
                        <span className="reply-icon">
                            <img src={reply_icon} />
                        </span>
                        { (expanded) ? (repliedMessage.content) : truncateWords(repliedMessage.content, 6) }
                    </div>
                    <div className={`chat-bubble ${role}`}>
                        <p className="reply-rating">Response Rating: {rating}/10</p>
                        <p>{content}</p>
                    </div>
                </div>) :
                (<div className={`another-chat-wrapper ${role}`}>
                    <span className="role-text">{(role === "user") ? "You" : name}</span>
                    <div className={`chat-bubble ${role}`} onClick={() => {if (role === "user") {handleClick?.();}}}>
                        <span className="content-text">{content}</span>
                    </div>
                </div>)
            }
        </div>
    );
}