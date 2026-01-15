import './VoiceMode.css';
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
};

export default function VoiceMode({ title, idx, messages, switchType, handleBack }: VoiceModeProps) {
    return (
        <div className="voice-chat">
            <div className="title-section">
                <div className="back-to-lessons" onClick={handleBack}>
                    <img src={left_arrow} />
                </div>
                <h3>{title} ({idx} of 3)</h3>
            </div>
            <div className="voice-receiver">
                <div className="voice-circle" /> 
                You are Speaking
            </div>
            { (messages.length > 0) ?
                (<div className="scroll-wrapper">
                    <div className="scrollable-transcript">
                        {messages.filter(m => m.role !== "assistant").map((m, i) => <ChatBubble key={i} role={m.role} content={m.content} name={m.name ?? ""} />)}
                    </div>
                    <p>Transcript</p>
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