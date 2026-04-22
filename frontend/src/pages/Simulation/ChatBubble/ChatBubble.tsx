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
import black_refresh from '../../../assets/icons/black-refresh-icon.svg';
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
    shouldApply?: boolean;
    handleApply?: () => void;
    voiceDescription?: string;
    lessonAttemptId?: string;
    simIndex?: number;
    productHints?: any;
    generalHints?: any;
    onShowHints?: () => void;
    voiceId?: string;
    voiceMode?: boolean;
};

export default function ChatBubble({ message, className, handleClick, shouldType, stopTyping, onTypingComplete, shouldRegenerate, handleRegenerate, onTypingUpdate, lessons, shouldApply, handleApply, voiceDescription, lessonAttemptId, simIndex, productHints, generalHints, onShowHints, voiceId, voiceMode }: ChatBubbleProps) {
    if (!message) return null; 

    const { role, name, content } = message;
    const safeContent = typeof content === "string" ? content : ""; 
    const cleanedContent = safeContent.replace(/\n{3,}/g, "\n\n");
    const messageScope = message.scope ?? [];

    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [showHints, setShowHints] = useState(false);

    const handleSpeak = async () => {
        try {
            if (isSpeaking) {
                audioRef.current?.pause();
                audioRef.current = null;
                setIsSpeaking(false);
                return;
            }
    
            const rawText = typeof message.content === "string" ? message.content : "";
            const text = rawText
                .replace(/\n{3,}/g, "\n\n")
                .replace(/\*\*([^*]+)\*\*/g, "$1")
                .replace(/\*([^*]+)\*/g, "$1")
                .replace(/__([^_]+)__/g, "$1")
                .replace(/_([^_]+)_/g, "$1")
                .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
                .trim();
    
            if (!text) return;

            if (!voiceId) {
                console.warn("Speak: missing voiceId for this simulation");
                return;
            }

            setIsSpeaking(true);

            const resp = await fetch("http://127.0.0.1:8000/ai/tts-elevenlabs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    voice_id: voiceId, 
                    text
                })
            });

            if (!resp.ok) {
                setIsSpeaking(false);
                return;
            }

            const url = URL.createObjectURL(await resp.blob());
            const audio = new Audio();
            (audio as HTMLAudioElement & { playsInline?: boolean }).playsInline = true;
            audio.src = url;
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
            <span className="role-text">{(role === "user") ? "You" : (role === "assistant") ? "Cadence" : name}</span>
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
             { showHints && productHints !== null &&
                <div className="product-hints-wrapper">
                    <div className="product-hints-label">
                        <div className="hint-circle">!</div>
                        Hints
                    </div>
                    <div className="hints-label">Possible Products</div>
                    <div className="product-hints">
                        {(productHints ?? []).map((hint:any, idx: number) => 
                            <div key={idx} className="product-hint-card">
                                <div className="hint-name">{hint.name}</div>
                                <div className="hint-category">Category: {hint.category}</div>
                                <div className="hint-bottom">
                                    <div className="green-pill">In stock</div>
                                    <div>${hint.price}</div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="hints-divider" />
                    <div className="hints-label">General Tips</div>
                    <div className="general-hints">
                        {(generalHints ?? []).map((hint:any, idx: number) =>
                            <div key={idx} className="general-hint-card">
                                <div className="hint-name">
                                    ‣ {hint.title}. 
                                    {" "}
                                    <span className="hint-desc">
                                        {hint.description}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="product-hints-message">These hints are only visible to you - use them to guide your response.</div>
                    
                </div> }
            <div className="chat-bubble-actions">
                {(role === "character") && (
                    <>
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
                        {productHints !== null &&
                        <button
                            className="speak-btn"
                            onClick={() => {
                                setShowHints(prev => {
                                    const next = !prev;
                        
                                    if (!prev && next) {
                                        setTimeout(() => {
                                            onShowHints?.();
                                        }, 0);
                                    }
                        
                                    return next;
                                });
                            }}
                        >
                            {showHints ? "Hide" : "Show"} hints
                        </button>}
                    </>
                )}
                { role == "assistant" && shouldApply &&
                    <button className="apply-btn" type="button" onClick={handleApply}>
                        <div className="wand-swap">
                            <img className="wand-icon default" src={white_wand} />
                            <img className="wand-icon hover" src={orange_wand} />
                        </div>
                        Apply this version
                    </button>
                }
                {role === "assistant" && className === "last-message" && shouldRegenerate &&
                <button className="speak-btn regenerate" onClick={() => handleRegenerate?.()}>
                    <img src={black_refresh} />
                    Regenerate
                </button>}
            </div>
        </div>
    );
}