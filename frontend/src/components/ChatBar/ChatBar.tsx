import './ChatBar.css';
import { useState } from 'react';
import paperclip_icon from '../../assets/icons/chatbar/paperclip-icon.svg';
import voice_icon from '../../assets/icons/chatbar/voice-msg-icon.svg';
import send_icon from '../../assets/icons/chatbar/send-icon.svg';

type ChatBarProps = {
    context: "builder" | "module" | "simulation";
};

export default function ChatBar({ context }: ChatBarProps) {
    const [userInput, setUserInput] = useState("");

    return (
        <div className="chat-bar-wrapper">
            <div className="chat-bar-input">
                <input type="text" placeholder="Describe your idea"  value={userInput} onChange={(e) => setUserInput(e.target.value)} />
                <span className="send-icon">
                    <img src={send_icon} />
                </span>
            </div>
            <div className="chat-actions-wrapper">
                <div className="chat-actions">
                    <div className="chat-action">
                        <span className="chat-action-icon">
                            <img src={paperclip_icon} />
                        </span>
                        Choose Reference Material
                    </div>
                    <div className="chat-action-divider" />
                    <div className="chat-action">
                        <span className="chat-action-icon">
                            <img src={voice_icon} />
                        </span>
                        Voice Message
                    </div>
                </div>
            </div>
        </div>
    );
}