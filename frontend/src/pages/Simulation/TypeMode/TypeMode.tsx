import './TypeMode.css';
import { useState, useEffect, useRef } from 'react';
import type { MessageType } from '../../../types/Modules/Lessons/Simulations/MessageType';
import ChatBubble from '../ChatBubble/ChatBubble';
import left_arrow from '../../../assets/icons/orange-left-arrow.svg';
import ai_mic from '../../../assets/icons/ai-mic.svg';
import send_icon from '../../../assets/icons/orange-up-icon-send.svg';

type TypeModeProps = {
    title: string;
    idx: number; 
    messages: MessageType[];
    switchType: () => void;
    handleBack: () => void;
};

export default function TypeMode({ title, idx, messages, switchType, handleBack }: TypeModeProps) {
    const transcriptRef = useRef<HTMLDivElement | null>(null);
    const [chatMessages, setChatMessages] = useState<MessageType[]>(messages ?? []);
    const [userInput, setUserInput] = useState("");

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

    const handleSend = () => {
        if (!userInput.trim()) return;

        const newMessage: MessageType = {
            role: "user",
            content: userInput,
        };

        setChatMessages(prev => [...prev, newMessage]);
        setUserInput("");
    };

    return (
        <div className="type-chat">
            <div className="title-section type">
                <div className="back-to-lessons" onClick={handleBack}>
                    <img src={left_arrow} />
                </div>
                <h3>{title} ({idx} of 3)</h3>
                <div className="filler text" />
            </div>
            <div className="scroll-wrapper text">
            { (chatMessages.length > 0) ?
                (<div className="scrollable-transcript text" ref={transcriptRef}>
                    <div className="scroll-spacer" />
                    {chatMessages.filter(m => m.role !== "assistant").map((m, i, arr) => <ChatBubble key={i} role={m.role} content={m.content} 
                    name={m.name ?? ""} className={i === arr.length - 1 ? "last-message" : ""} />)}
                </div>) :
                (<div className="empty-wrapper text">

                </div>)
            }    
                    <div className="blur-top text" />
                    <div className="blur-bottom text" />
                    <div className="chat-input">
                        <div className="chat-wrapper">
                            <span className="chat-input-icon" onClick={switchType}>
                                <img src={ai_mic} />
                            </span>
                            <input type="text" placeholder="Enter your response" value={userInput} onChange={(e) => setUserInput(e.target.value)} 
                            onKeyDown={(e) => {if (e.key === "Enter") {e.preventDefault(); handleSend();}}}/>
                            <span className="chat-input-icon" onClick={handleSend}>
                                <img src={send_icon} />
                            </span>
                        </div>
                    </div>
            </div>
        </div>
    );
}