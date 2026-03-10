import './VoiceMode.css';
import { useState, useEffect, useRef } from "react";
import type { MessageType } from '../../../types/Modules/Lessons/Simulations/MessageType';
import ChatBubble from '../ChatBubble/ChatBubble';
import keyboard_icon from '../../../assets/icons/keyboard.svg';
import left_arrow from '../../../assets/icons/orange-left-arrow.svg';

type VoiceModeProps = {
    title: string;
    idx: number; 
    messages: MessageType[];
    switchType: () => void;
    handleBack: () => void;
    handleClick: (messageID: string) => void;
    handleSendMessage: (text: string) => void;
    characterName: string;
    voiceDescription?: string;
};

export default function VoiceMode({ title, idx, messages, switchType, handleBack, handleClick, handleSendMessage, characterName, voiceDescription }: VoiceModeProps) {
    const transcriptRef = useRef<HTMLDivElement | null>(null);
    const [chatMessages, setChatMessages] = useState<MessageType[]>(messages ?? []);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);

    useEffect(() => {
        if (transcriptRef.current) {
          transcriptRef.current.scrollTop =
            transcriptRef.current.scrollHeight;
        }
    }, [chatMessages]);

    useEffect(() => {
        const el = transcriptRef.current;
        if (!el) return;
    
        el.scrollTop = el.scrollHeight;
    }, [chatMessages]);

    const handleToggleRecording = async () => {
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
            };

            recorder.start();
            setIsRecording(true);
        } catch {
            setIsRecording(false);
        }
    };
      
    return (
        <div className="voice-chat">
            <div className="title-section">
                <div className="back-to-lessons" onClick={handleBack}>
                    <img src={left_arrow} />
                </div>
                <h3>{title} ({idx} of 3)</h3>
            </div>
            <div className={`voice-receiver ${isRecording ? "recording" : ""}`} onClick={handleToggleRecording}>
                <div className={`voice-circle ${isRecording ? "pulse" : ""}`} /> 
                {isRecording ? "Tap to Finish" : "Tap to Speak"}
            </div>
            { (chatMessages.length > 0) ?
                (<div className="scroll-wrapper">
                    <div className="scrollable-transcript" ref={transcriptRef}>
                        {chatMessages.filter(m => m.role !== "assistant").map((m, i, arr) => <ChatBubble key={m.id} 
                        message={m} className={i === arr.length - 1 ? "last-message" : i === 0 ? "first-message": ""}
                        handleClick={() => handleClick(m.id)} voiceDescription={voiceDescription} />)}
                    </div>
                    <p className="transcript-label">Transcript</p>
                    <div className="blur-top" />
                    <div className="blur-bottom" />
                </div>) :
                (<div className="empty-wrapper">
                    Your transcript will show up here.
                </div>)
            }
            <div className="voice-pg-footer">
                <button onClick={switchType}>
                    <span>
                        <img src={keyboard_icon} />
                    </span>
                    Switch to Typing
                </button>
            </div>
        </div>
    );
}