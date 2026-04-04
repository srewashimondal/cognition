import './VoiceMode.css';
import { useState, useEffect, useRef } from "react";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from '../../../firebase';
import type { MessageType } from '../../../types/Modules/Lessons/Simulations/MessageType';
import ChatBubble from '../ChatBubble/ChatBubble';
import left_arrow from '../../../assets/icons/orange-left-arrow.svg';
import { Tooltip } from "@radix-ui/themes";
import keyboard_icon from '../../../assets/icons/black-keyboard-icon.svg';
import stop_icon from '../../../assets/icons/chatbar/black-stop-icon.svg';
import play_icon from '../../../assets/icons/black-play-icon.svg';
import pause_icon from '../../../assets/icons/black-pause-icon.svg';

type VoiceModeProps = {
    title: string;
    idx: number;
    lessonAttemptId?: string;
    simIndex?: number;
    messages: MessageType[];
    switchType: () => void;
    handleBack: () => void;
    handleClick: (messageID: string) => void;
    handleSendMessage: (text: string) => void;
    characterName: string;
    voiceDescription?: string;
    voiceId?: string;
    isSpeaking?: boolean;
    voiceLevel?: number;
    onSpeak?: (text: string) => void;
    onStop?: () => void;
};

export default function VoiceMode({ title, idx, lessonAttemptId, simIndex, messages, switchType, handleBack, handleClick, handleSendMessage, characterName, voiceDescription, voiceId, isSpeaking, voiceLevel, onSpeak, onStop }: VoiceModeProps) {
    const transcriptRef = useRef<HTMLDivElement | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isStopped, setIsStopped] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [currentMessage, setCurrentMessage] = useState<MessageType | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);

    const displayMessages = (messages ?? []).filter(m => m.role !== "assistant");
    const isUserTurn =
        status === "started" &&
        !isSpeaking &&
        !isStopped;

    useEffect(() => {
        setIsStopped(true); 
    }, []);

    useEffect(() => {
        if (!lessonAttemptId || simIndex === undefined) return;

        const simDocRef = doc(
            db,
            "simulationLessonAttempts",
            lessonAttemptId,
            "simulations",
            `sim_${simIndex}`
        );

        const unsub = onSnapshot(simDocRef, (snap) => {
            if (!snap.exists()) return;

            const data = snap.data();
            setStatus(data.completionStatus ?? null);
        });

        return () => unsub();
    }, [lessonAttemptId, simIndex]);

    useEffect(() => {
        const el = transcriptRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [messages]);

    /*const handleToggleRecording = async () => {
        if (!canRecord && !isRecording) return;

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
                setIsRecording(false);
                stream.getTracks().forEach(t => t.stop());

                const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
                audioChunksRef.current = [];

                setIsProcessing(true);
                try {
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

                    await handleSendMessage(text);
                } finally {
                    setIsProcessing(false);
                }
            };

            recorder.start();
            setIsRecording(true);
        } catch {
            setIsRecording(false);
            setIsProcessing(false);
        }
    }; */
    const shouldProcessRef = useRef(true);
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
    
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];
    
            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };
    
            recorder.onstop = async () => {
                setIsRecording(false);

                if (!shouldProcessRef.current) {
                    shouldProcessRef.current = true;
                    return;
                }

                stream.getTracks().forEach(t => t.stop());
    
                const blob = new Blob(audioChunksRef.current, {
                    type: recorder.mimeType || "audio/webm"
                });
    
                audioChunksRef.current = [];
    
                setIsProcessing(true);
    
                try {
                    const form = new FormData();
                    form.append("file", blob, "voice.webm");
    
                    const resp = await fetch("http://127.0.0.1:8000/ai/stt", {
                        method: "POST",
                        body: form,
                    });
    
                    if (!resp.ok) return;
    
                    const data = await resp.json();
                    const text = (data?.text ?? "").trim();
    
                    if (text) {
                        setCurrentMessage({
                            id: "temp-" + Date.now(),
                            role: "user",
                            content: text,
                        });
                        await handleSendMessage(text); 
                    }
                } finally {
                    setIsProcessing(false);
                }
            };
    
            recorder.start();
            setIsRecording(true);
        } catch {
            setIsRecording(false);
            setIsProcessing(false);
        }
    };

    const stopRecording = () => {
        shouldProcessRef.current = true;
        mediaRecorderRef.current?.stop();
    };

    const handlePause = () => {
        setIsStopped(true);

        shouldProcessRef.current = false;

        onStop?.();
    
        if (isRecording) {
            shouldProcessRef.current = false;
            mediaRecorderRef.current?.stop();
        }
    };

    useEffect(() => {
        const shouldRecord =
            status === "started" &&
            !isSpeaking &&
            !isStopped &&
            !isProcessing;
    
        if (shouldRecord && !isRecording) {
            startRecording();
        }
    
        if ((isSpeaking || isProcessing) && isRecording) {
            stopRecording();
        }
    }, [isSpeaking, isStopped, isProcessing, status]);

    const handlePlay = async () => {

        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
            return; 
        }

        if (status === "not begun") {
            const simDocRef = doc(
                db,
                "simulationLessonAttempts",
                lessonAttemptId!,
                "simulations",
                `sim_${simIndex}`
            );

            await updateDoc(simDocRef, {
                completionStatus: "started"
            });
            setStatus("started");
        }
        setIsStopped(false);

        if (!messages || messages.length === 0) return;

        const lastRelevant = [...messages]
            .reverse()
            .find(m => m.role === "character");

        if (!lastRelevant) return;

        setCurrentMessage(lastRelevant);

        const text = typeof lastRelevant.content === "string"
            ? lastRelevant.content
            : "";

        if (!text.trim()) return;

        onSpeak?.(text);
    }

    useEffect(() => {
        if (!messages || messages.length === 0) return;

        if (isProcessing) return;
    
        const lastRelevant = [...messages]
            .reverse()
            .find(m => m.role === "character");
    
        setCurrentMessage(lastRelevant ?? null);
    }, [messages, isProcessing]);

    const scrollToBottom = () => {
        const el = transcriptRef.current;
        if (!el) return;
        el.scrollTo({
            top: el.scrollHeight,
            behavior: "smooth" 
        });
    };
      
    return (
        <div className="voice-chat">
            <div className="title-section">
                <div className="back-to-lessons" onClick={handleBack}>
                    <img src={left_arrow} />
                </div>
                <h3>{title} ({idx} of 3)</h3>
            </div>

            <div className={`call-center ${!isStopped ? "active" : ""}`}>
                <div className={`voice-receiver ${isRecording ? "recording" : ""}`}>
                    <div className={`voice-circle 
                        ${isRecording ? "pulse" : ""} 
                        ${isProcessing ? "processing" : ""}
                        ${isUserTurn ? "user-turn" : ""}`} 
                        style={{
                            transform: isSpeaking
                            ? `scale(${1 + (voiceLevel ?? 0) * 0.8})`
                            : "scale(1)",
                            transition: "transform 0.1s linear"
                        }}
                    />
                    {isProcessing
                        ? "Processing your response..."
                        : isRecording
                        ? "Your turn"
                        : characterName}
                </div>
            
                { (isStopped && status === "started") ?
                    (<div className="scroll-wrapper">
                        <div className="resume-btn-wrapper">
                            <button className="voice-mode-cta"
                                onClick={handlePlay}>
                                <img src={play_icon} />
                                Resume
                            </button>
                        </div>
                        <div className="scroll-top">
                            <div className="transcript-label">Transcript</div>
                            <Tooltip content="Switch to typing">
                                <button onClick={switchType}>
                                        <img src={keyboard_icon} />
                                </button>
                            </Tooltip>
                        </div>
                        <div className="scrollable-transcript voice" ref={transcriptRef}>
                            {displayMessages.map((m, i, arr) => {
                            const isFirst = m.id === arr[0]?.id;
                            const isLast = m.id === arr[arr.length - 1]?.id;
                            return (
                            <ChatBubble 
                                key={m.id} message={m} 
                                className={i === arr.length - 1 ? "last-message" : i === 0 ? "first-message": ""}
                                handleClick={() => handleClick(m.id)} 
                                voiceDescription={voiceDescription}
                                voiceId={voiceId}
                                lessonAttemptId={lessonAttemptId} 
                                simIndex={simIndex} 
                                onShowHints={scrollToBottom} 
                                voiceMode={true}
                                productHints={(m.productHints && isLast && !isFirst) ? m.productHints : null}
                                generalHints={(m.hints && isLast && !isFirst) ? m.hints : null}
                            />)
                            })}
                        </div>
                    </div>) :
                    (<div className="empty-wrapper">
                        { (status === "not begun") &&
                            <p className="voice-mode-text">{characterName} will speak first when you begin</p>
                        }
                        <div className="voice-mode-actions">
                            <button
                                className="voice-mode-cta"
                                onClick={() =>{
                                    if (status === "not begun") {
                                        handlePlay();
                                    } else if (isRecording) {
                                        stopRecording();
                                    } else if (!isStopped) {
                                        handlePause();
                                    } else {
                                        handlePlay();
                                    }
                                }}
                            >

                                <img
                                src={
                                    status === "not begun"
                                    ? play_icon
                                    : isRecording
                                    ? stop_icon
                                    : isStopped
                                    ? play_icon
                                    : pause_icon
                                }
                                />

                                {(status === "not begun")
                                    ? "Begin Conversation"
                                    : isRecording
                                    ? "Done Speaking"
                                    : isStopped 
                                    ? "Resume Conversation"
                                    : "Pause Conversation"
                                }
                            </button>

                            {isRecording && (
                                <button
                                    className="voice-mode-cta"
                                    onClick={handlePause}
                                >
                                    <img src={pause_icon} />
                                </button>
                            )}
                        </div>
                        { (currentMessage !== null && status !== "not begun") &&
                        <div 
                            key={currentMessage.id + currentMessage.role}
                            className={`cb-wrapper ${currentMessage.role === "user" ? "user" : "character"}`}
                        >
                            <ChatBubble 
                                key={currentMessage.id} 
                                message={currentMessage}
                                voiceMode={true}
                                productHints={(currentMessage.productHints) ? currentMessage.productHints : null}
                                generalHints={(currentMessage.hints) ? currentMessage.hints : null}
                            />
                        </div>
                        }

                    </div>)
                }
            </div>
            {/*<div className="voice-pg-footer">
                <Tooltip content="Switch to typing">
                    <button onClick={switchType}>
                            <img src={keyboard_icon} />
                    </button>
                </Tooltip>
            </div>*/}
        </div>
    );
}