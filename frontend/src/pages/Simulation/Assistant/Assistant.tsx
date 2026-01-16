import './Assistant.css';
import ChatBubble from '../ChatBubble/ChatBubble';
import type { MessageType } from '../../../types/Modules/Lessons/Simulations/MessageType';

type AssistantProps = {
    messages: MessageType[];
};

export default function Assistant({ messages }: AssistantProps) {
    return (
        <div className="assistant-box">
            <div className="assistant-messages">
                {messages.filter(m => m.role === "assistant").map((m, i, arr) => 
                <ChatBubble key={m.id} message={m} allMessages={messages} 
                className={i === arr.length - 1 ? "last-message" : i === 0 ? "first-message": ""} />)}
            </div>
            <div className="assistant-tracker">
                <div>

                </div>
                <strong>Cognition AI is evaluating</strong>
            </div>
        </div>
    );
}