import './ChatBar.css';
import { useState, useRef, useEffect } from 'react';
import type { LessonType } from '../../types/Modules/Lessons/LessonType';
import AttachmentItem from '../AttachmentItem/AttachmentItem';
import ContextItem from './ContextItem/ContextItem';
import paperclip_icon from '../../assets/icons/chatbar/paperclip-icon.svg';
import voice_icon from '../../assets/icons/chatbar/voice-msg-icon.svg';
import send_icon from '../../assets/icons/chatbar/send-icon.svg';
import plus_icon from '../../assets/icons/chatbar/black-plus-icon.svg';
import globe_icon from '../../assets/icons/simulations/black-globe-icon.svg';
import cap_icon from '../../assets/icons/simulations/black-cap-icon.svg';

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
    pageContext?: (string | LessonType)[];
};

export default function ChatBar({ context, userInput, setUserInput, handleSend, handleAttach, attachedFiles, showFileCond, handleRemoveFile, handleVoiceMode, pageContext }: ChatBarProps) {
    const [showContext, setShowContext] = useState(false);
    const [pageContextState, setPageContextState] = useState<(string | LessonType)[] | null>(pageContext ?? null);
    const [selectedContext, setSelectedContext] = useState<(string | LessonType)[] | null>(null);
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

    const handleContextClick = (l: string | LessonType) => {
        setSelectedContext(prev => {
            const current = prev ?? [];
            const exists =
            typeof l === "string" ? current.includes(l) : current.some(item => typeof item !== "string" && item.id === l.id);
        
            if (exists) {
            setPageContextState(pc => {
                const alreadyThere =
                typeof l === "string" ? (pc ?? []).includes(l)
                    : (pc ?? []).some(
                        item =>
                        typeof item !== "string" &&
                        item.id === l.id
                    );
        
                return alreadyThere ? pc : [...(pc ?? []), l];
            });
        
            return current.filter(item =>
                typeof l === "string" ? item !== l
                : typeof item !== "string" && item.id !== l.id
            );
            }
        
            setPageContextState(pc =>
            (pc ?? []).filter(item =>
                typeof l === "string" ? item !== l
                : typeof item === "string"
                    ? true
                    : item.id !== l.id
            )
            );
        
            return [...current, l];
        });
    };
      
    const handleRemoveFromContext = (contextToRemove: string | LessonType) => {
        handleContextClick(contextToRemove);
    };

    const chatBarRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                chatBarRef.current &&
                !chatBarRef.current.contains(e.target as Node)
            ) {
                setShowContext(false);
            }
        };
      
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
      
    return (
        <div className={`main-chat-wrapper ${context}`} ref={chatBarRef}>
        { (showContext) && 
            <div className={`context-wrapper ${((selectedContext?.length ?? 0) > 0) ? "move-up" : ""}`}>
                {pageContextState?.map((l) => <div className="context-item" onClick={(e) => {e.stopPropagation(); handleContextClick(l);}}>
                    <span>
                        <img src={typeof l === "string" ? globe_icon : cap_icon} />
                    </span>
                    {typeof l === "string" ? l : l.title}
                </div>)}
            </div> }
        <div className={`chat-bar-wrapper ${context}`}>
            <div className="chat-bar-input-context">
                { (showFileCond && (attachedFiles?.length ?? 0) > 0) &&
                    <div className="attached-items-wrapper">
                        {attachedFiles?.map((f) => <AttachmentItem fileName={f} onClick={() => handleRemoveFile?.(f)} />)}
                    </div>
                }
                {
                    ((selectedContext?.length ?? 0) > 0) && (
                        <div className="selected-context-wrapper">
                            {selectedContext
                                ?.filter((l): l is string => typeof l === "string")
                                .map((l) => (
                                    <ContextItem label={l} global={true} handleRemove={() => handleRemoveFromContext(l)} />
                                ))}
                            {selectedContext
                                ?.filter((l): l is LessonType => typeof l !== "string")
                                .map((l) => (
                                    <ContextItem label={l.title} global={false} handleRemove={() => handleRemoveFromContext(l)} />
                            ))}
                        </div>
                    )
                }
                <div className={`chat-bar-input ${(showFileCond && (attachedFiles?.length ?? 0)) ? "expanded" : ""}`}>
                    <textarea placeholder={contextToPlaceholder[context]} value={userInput} 
                    onChange={(e) => {setUserInput(e.target.value); handleTextareaChange(e);}} 
                    onKeyDown={(e) => {if (e.key === "Enter") {e.preventDefault(); handleSend();}}} />
                    <span className="send-icon" onClick={handleSend}>
                        <img src={send_icon} />
                    </span>
                </div>
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
                    {(context === "module") &&
                    <>
                        <div className={`chat-action ${showContext ? "selected": ""}`} onClick={() => setShowContext(true)}>
                            <span className="chat-action-icon">
                                <img src={plus_icon} />
                            </span>
                            Add Context
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
        </div>
    );
}