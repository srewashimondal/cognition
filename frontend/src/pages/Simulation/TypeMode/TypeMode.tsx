import './TypeMode.css';
import { useState, useEffect, useRef } from 'react';
import type { MessageType } from '../../../types/Modules/Lessons/Simulations/MessageType';
import ChatBubble from '../ChatBubble/ChatBubble';
import { Tooltip } from "@radix-ui/themes";
import left_arrow from '../../../assets/icons/orange-left-arrow.svg';
import send_icon from '../../../assets/icons/chatbar/send-icon.svg';
import stop_icon from '../../../assets/icons/chatbar/black-stop-icon.svg';
import voice_icon from '../../../assets/icons/chatbar/voice-msg-icon.svg';

type TypeModeProps = {
    title: string;
    idx: number;
    lessonAttemptId?: string;
    simIndex?: number;
    voiceDescription?: string;
    messages: MessageType[];
    switchType: () => void;
    handleBack: () => void;
    handleClick: (messageID: string) => void;
    handleSendMessage: (text: string) => void;
    onTypingComplete: () => void;
    typingMessageId: string | null;
    name: string;
    generalHints?: any;
};

export default function TypeMode({ title, idx, lessonAttemptId, simIndex, voiceDescription, messages, switchType, handleBack, handleClick, handleSendMessage, onTypingComplete, typingMessageId, name }: TypeModeProps) {
    const transcriptRef = useRef<HTMLDivElement | null>(null);
    const [userInput, setUserInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (transcriptRef.current) {
          transcriptRef.current.scrollTop =
            transcriptRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const el = transcriptRef.current;
        if (!el) return;
    
        el.scrollTop = el.scrollHeight;
    }, [messages]);

    const handleSend = async () => {
        const text = userInput.trim();
        if (!text) return;

        setUserInput("");
        setIsLoading(true);

        await handleSendMessage(text);
        setIsLoading(false);
    };

    console.log("typingMessageId:", typingMessageId);
    const inputEmpty = userInput.trim() === "";

    const scrollToBottom = () => {
        const el = transcriptRef.current;
        if (!el) return;
        el.scrollTo({
            top: el.scrollHeight,
            behavior: "smooth" 
        });
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
            { (messages.length > 0) ?
                (<div className="scrollable-transcript text" ref={transcriptRef}>
                    {messages.filter(m => m.role !== "assistant").map((m, i, arr) => 
                        {   
                            const shouldType = m.role === "character" && m.id === typingMessageId;
                            const isFirst = m.id === arr[0]?.id;
                            const isLast = m.id === arr[arr.length - 1]?.id;

                            return (
                            <ChatBubble 
                                key={m.id} message={m}
                                className={isLast ? "last-message" : isFirst ? "first-message": ""}
                                handleClick={() => handleClick(m.id)} 
                                productHints={(m.productHints && isLast && !isFirst) ? m.productHints : null}         
                                shouldType={shouldType} 
                                onTypingComplete={onTypingComplete} 
                                onShowHints={scrollToBottom} 
                                voiceDescription={voiceDescription} 
                                lessonAttemptId={lessonAttemptId} 
                                simIndex={simIndex} 
                                generalHints={(m.hints && isLast && !isFirst) ? m.hints : null}
                            />)
                        })}
                    {isLoading && (
                        <div className="chat-bubble-wrapper character loading-simulation">
                            <span className="role-text">{name}</span>
                            <div className="chat-bubble character loading-bubble">
                                <div className="spinner" />
                            </div>
                        </div>
                    )}
                </div>) :
                (<div className="empty-wrapper text">

                </div>)
            }    
                {/*<div className="blur-top text" />
                <div className="blur-bottom text" />*/}
                {/*<div className="chat-input">
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
                </div>*/}
                <div className="chatbar-wrapper chat-input">
                    {/*<ChatBar context="simulation" userInput={userInput} setUserInput={setUserInput} handleSend={handleSend} handleVoiceMode={switchType} 
                    typingMessageId={typingMessageId} handleStop={onTypingComplete} />*/}
                    <div className="simulation-chatbar">
                        <textarea placeholder="Enter your response" value={userInput} 
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }}} />
                    </div>
                    <Tooltip content={typingMessageId !== null ? "Stop" : inputEmpty ? "Switch to speaking" : "Send"}>
                        <div className="simulation-chatbar-cta" 
                            onClick={() => {
                                if (typingMessageId !== null) {
                                    onTypingComplete();
                                    return;
                                }
                            
                                if (inputEmpty) {
                                    switchType(); 
                                    return;
                                }
                            
                                handleSend();
                            }}
                        >
                            <img
                                src={
                                    typingMessageId !== null
                                    ? stop_icon
                                    : inputEmpty
                                    ? voice_icon
                                    : send_icon
                                }
                            />
                        </div>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}