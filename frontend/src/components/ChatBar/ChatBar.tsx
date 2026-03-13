import './ChatBar.css';
import { useState, useRef, useEffect } from 'react';
import type { LessonType } from '../../types/Modules/Lessons/LessonType';
import type { DocumentReference } from 'firebase/firestore';
import AttachmentItem from '../AttachmentItem/AttachmentItem';
import ContextItem from './ContextItem/ContextItem';
import paperclip_icon from '../../assets/icons/chatbar/paperclip-icon.svg';
import voice_icon from '../../assets/icons/chatbar/voice-msg-icon.svg';
import send_icon from '../../assets/icons/chatbar/send-icon.svg';
import plus_icon from '../../assets/icons/chatbar/black-plus-icon.svg';
import globe_icon from '../../assets/icons/simulations/black-globe-icon.svg';
import cap_icon from '../../assets/icons/simulations/black-cap-icon.svg';
import stop_icon from '../../assets/icons/chatbar/black-stop-icon.svg';

type ChatBarProps = {
    context: "builder" | "module" | "simulation" | "summary";
    userInput: string;
    setUserInput: (userInput: string) => void;
    handleSend: () => void;
    handleAttach?: () => void;
    attachedFiles?: {
        id: string;
        title: string;
        ref: DocumentReference;
    }[];
    showFileCond?: boolean;
    handleRemoveFile?: (fileName: string) => void;
    handleVoiceMode?: () => void;
    pageContext?: { id: string; label: string; isModule?: boolean }[];
    typingMessageId?: string | null;
    handleStop?: () => void;
    setCurrentScope?: (currentScope: string[]) => void;
};

export default function ChatBar({ context, userInput, setUserInput, handleSend, handleAttach, attachedFiles, showFileCond, handleRemoveFile, handleVoiceMode, pageContext, typingMessageId, handleStop, setCurrentScope }: ChatBarProps) {
    const [showContext, setShowContext] = useState(false);
    const [pageContextState, setPageContextState] = useState<{ id: string; label: string; isModule?: boolean }[] | null>(pageContext ?? null);
    const [selectedContext, setSelectedContext] = useState<string[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUserInput(e.target.value);
        const el = e.target;
        el.style.height = "auto"; 
        el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
    };
    const contextToPlaceholder = {
        "builder": "Describe your idea",
        "module": "Tell Cognition AI what to adjust",
        "simulation": "Enter your response",
        "summary": "Any questions?"
    };

    const handleContextClick = (id: string) => {
        setSelectedContext(prev => {
            const exists = prev.includes(id);
            const newSelection = exists
                ? prev.filter(item => item !== id)
                : [...prev, id];
    
            setCurrentScope?.(newSelection);
            return newSelection;
        });
    };

    useEffect(() => {
        setPageContextState(pageContext ?? null);
    }, [pageContext]);

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

    const handleSendOrStop = () => {
        if (typingMessageId !== null) {
            handleStop?.();
            return;
        }
        handleSend();
        setSelectedContext([]);
    }   

    const handleVoiceMessage = async () => {
        try {
            if (isRecording) {
                mediaRecorderRef.current?.stop();
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                try {
                    setIsRecording(false);
                    stream.getTracks().forEach(t => t.stop());

                    const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
                    audioChunksRef.current = [];

                    const form = new FormData();
                    form.append("file", blob, "voice.webm");

                    const resp = await fetch("http://127.0.0.1:8000/ai/stt", {
                        method: "POST",
                        body: form,
                    });

                    if (!resp.ok) return;
                    const data = await resp.json();
                    const text = (data?.text ?? "").trim();
                    if (!text) return;

                    setUserInput(text);

                    // auto-send for simulation context; otherwise just fill textbox
                    if (context === "simulation") {
                        // ensure state update has applied before sending
                        setTimeout(() => handleSend(), 0);
                    }
                } catch {
                    setIsRecording(false);
                    stream.getTracks().forEach(t => t.stop());
                }
            };

            recorder.start();
            setIsRecording(true);
        } catch {
            setIsRecording(false);
        }
    };

    console.log("ChatBar typingMessageId:", typingMessageId);
      
    return (
        <div className={`main-chat-wrapper ${context}`} ref={chatBarRef}>
        { (showContext && (pageContextState?.length ?? 0) > 0) && 
            <div className={`context-wrapper ${((selectedContext?.length ?? 0) > 0) ? "move-up" : ""}`}>
                {pageContextState?.map((item) => (
                    <div key={item.id} className="context-item"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleContextClick(item.id);
                        }}>
                        <span>
                            <img src={item.isModule ? globe_icon : cap_icon} />
                        </span>
                        {item.label}
                    </div>
                ))}

            </div> }
        <div className={`chat-bar-wrapper ${context}`}>
            <div className="chat-bar-input-context">
                { (showFileCond && (attachedFiles?.length ?? 0) > 0) &&
                    <div className="attached-items-wrapper">
                        {attachedFiles?.map((f) => <AttachmentItem key={f.id} fileName={f.title} onClick={() => handleRemoveFile?.(f.id)} />)}
                    </div>
                }

                {selectedContext.length !== 0 && <div className="selected-context-wrapper">
                    {selectedContext.map((id) => {
                        const item = pageContextState?.find(p => p.id === id);
                        if (!item) return null;

                        return (
                            <ContextItem key={id} label={item.label}
                            global={item.isModule ?? false} handleRemove={() => handleContextClick(id)} />
                        );
                    })}
                </div>}

                <div className={`chat-bar-input ${(showFileCond && (attachedFiles?.length ?? 0)) ? "expanded" : ""}`}>
                    <textarea placeholder={contextToPlaceholder[context]} value={userInput} 
                    onChange={(e) => {setUserInput(e.target.value); handleTextareaChange(e);}} 
                    onKeyUp={(e) => {if (e.key === "Enter") {e.preventDefault(); handleSend(); setSelectedContext([]);}}} />
                    <span className="send-icon" onClick={handleSendOrStop}>
                        <img src={typingMessageId !== null ? stop_icon : send_icon} />
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
                    <div className="chat-action" onClick={handleVoiceMessage}>
                        <span className="chat-action-icon">
                            <img src={isRecording ? stop_icon : voice_icon} />
                        </span>
                        {isRecording ? "Stop Recording" : "Voice Message"}
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}