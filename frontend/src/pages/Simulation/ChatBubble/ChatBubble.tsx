import './ChatBubble.css';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TypingMessage from '../../../components/TypingMessage/TypingMessage';
import ContextItem from '../../../components/ChatBar/ContextItem/ContextItem';
import type { MessageType } from '../../../types/Modules/Lessons/Simulations/MessageType';
import type { LessonType } from '../../../types/Modules/Lessons/LessonType';
import regen_icon from '../../../assets/icons/simulations/grey-refresh-icon.svg';
import orange_wand from '../../../assets/icons/orange-wand-icon.svg';
import white_wand from '../../../assets/icons/white-wand-icon.svg';
import orange_refresh from '../../../assets/icons/orange-refresh-icon.svg';
import white_refresh from '../../../assets/icons/white-refresh-icon.svg';

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
    lessons?: LessonType[];
    handleApply?: () => void;
};

export default function ChatBubble({ message, className, handleClick, shouldType, stopTyping, onTypingComplete, shouldRegenerate, handleRegenerate, onTypingUpdate, lessons, handleApply }: ChatBubbleProps) {
    if (!message) return null; 

    const { role, name, content } = message;
    const safeContent = typeof content === "string" ? content : ""; 
    const cleanedContent = safeContent.replace(/\n{3,}/g, "\n\n");
    const messageScope = message.scope ?? [];
      
    return (
        <div className={`chat-bubble-wrapper ${role} ${className ?? ""} `}>
            <span className="role-text">{(role === "user") ? "You" : (role === "assistant") ? "Cognition" : name}</span>
            <div className={`chat-bubble ${role}`} onClick={() => {if (role === "user") {handleClick?.();}}}>

            {messageScope.length > 0 && role === "user" && lessons && (
                <div className="scope-wrapper">
                    {messageScope.map(id => {
                        if (id === "module") {
                            return (
                                <ContextItem key="module" label="Module Base" global={true} isStatic={true} />
                            );
                        }

                        const lesson = lessons.find(l => l.id === id);
                        if (!lesson) return null;

                        return (
                            <ContextItem key={id} label={lesson.title} global={false} isStatic={true} />
                        );
                    })}
                </div>
            )}


                <div className="content-text">
                    { role === "assistant" && shouldType ?
                        <TypingMessage text={content} shouldStop={stopTyping} onComplete={onTypingComplete} onUpdate={onTypingUpdate}/> : 
                        <ReactMarkdown remarkPlugins={[remarkGfm]}> 
                            {cleanedContent}
                        </ReactMarkdown>
                    }
                </div>
            </div>
            <div className="chat-bubble-actions">
                { role == "assistant" && handleApply &&
                    <button className="apply-btn" type="button" onClick={handleApply}>
                        <div className="wand-swap">
                            <img className="wand-icon default" src={white_wand} />
                            <img className="wand-icon hover" src={orange_wand} />
                        </div>
                        Apply this version
                    </button>
                }
                {role === "assistant" && className === "last-message" && shouldRegenerate &&
                <button className="regenerate-btn" onClick={() => handleRegenerate?.()}>
                    <div className="wand-swap">
                        <img className="wand-icon default" src={white_refresh} />
                        <img className="wand-icon hover" src={orange_refresh} />
                    </div>
                    Regenerate
                </button>}
            </div>
        </div>
    );
}