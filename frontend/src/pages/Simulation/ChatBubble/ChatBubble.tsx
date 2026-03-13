import './ChatBubble.css';
import { useRef, useState } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TypingMessage from '../../../components/TypingMessage/TypingMessage';
import ContextItem from '../../../components/ChatBar/ContextItem/ContextItem';
import type { MessageType } from '../../../types/Modules/Lessons/Simulations/MessageType';
import type { LessonType } from '../../../types/Modules/Lessons/LessonType';
import orange_wand from '../../../assets/icons/orange-wand-icon.svg';
import white_wand from '../../../assets/icons/white-wand-icon.svg';
import orange_refresh from '../../../assets/icons/orange-refresh-icon.svg';
import white_refresh from '../../../assets/icons/white-refresh-icon.svg';
import speaker_icon from '../../../assets/icons/speaker.svg';

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
    voiceDescription?: string;
};

export default function ChatBubble({ message, className, handleClick, shouldType, stopTyping, onTypingComplete, shouldRegenerate, handleRegenerate, onTypingUpdate, lessons, handleApply, voiceDescription }: ChatBubbleProps) {
    if (!message) return null; 

    const { role, name, content } = message;
    const safeContent = typeof content === "string" ? content : ""; 
    const cleanedContent = safeContent.replace(/\n{3,}/g, "\n\n");
    const messageScope = message.scope ?? [];

    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleSpeak = async () => {
        try {
            if (isSpeaking) {
                audioRef.current?.pause();
                audioRef.current = null;
                setIsSpeaking(false);
                return;
            }

            const characterName = (role === "character" ? (name ?? "Character") : "Cognition");
            const text = cleanedContent.trim();
            if (!text) return;

            setIsSpeaking(true);

            const resp = await fetch("http://127.0.0.1:8000/ai/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    character_name: characterName,
                    text,
                    description: voiceDescription
                })
            });

            if (!resp.ok) {
                setIsSpeaking(false);
                return;
            }

            const blob = await resp.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audioRef.current = audio;

            audio.onended = () => {
                URL.revokeObjectURL(url);
                audioRef.current = null;
                setIsSpeaking(false);
            };
            audio.onerror = () => {
                URL.revokeObjectURL(url);
                audioRef.current = null;
                setIsSpeaking(false);
            };

            await audio.play();
        } catch (e) {
            setIsSpeaking(false);
        }
    };
      
    return (
        <div className={`chat-bubble-wrapper ${role} ${className ?? ""} `}>
            <span className="role-text">{(role === "user") ? "You" : (role === "assistant") ? "Cognition" : name}</span>
            <div className={`chat-bubble ${role}`} onClick={() => {if (role === "user") {handleClick?.();}}}>

            {messageScope.length > 0 && role === "user" && lessons && (
                <div className="scope-wrapper">
                    {messageScope.map(id => {
                        if (!lessons.find(l => l.id === id)) {
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
                    { (role === "assistant" || role === "character") && shouldType ?
                        <TypingMessage text={content} shouldStop={stopTyping} onComplete={onTypingComplete} onUpdate={onTypingUpdate}/> : 
                        <ReactMarkdown remarkPlugins={[remarkGfm]}> 
                            {cleanedContent}
                        </ReactMarkdown>
                    }
                </div>
            </div>
            <div className="chat-bubble-actions">
                {(role === "character") && (
                    <button
                        className={`speak-btn ${isSpeaking ? "speaking" : ""}`}
                        type="button"
                        onClick={handleSpeak}
                        aria-label={isSpeaking ? "Stop voice" : "Play voice"}
                        title={isSpeaking ? "Stop voice" : "Play voice"}
                    >
                        <img src={speaker_icon} alt="" />
                        {isSpeaking ? "Stop" : "Speak"}
                    </button>
                )}
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