import './TypingMessage.css';
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";

type TypingMessageProps = {
    text: string;
    speed?: number; 
    onComplete?: () => void;
    shouldStop?: boolean;
    onUpdate?: () => void;
};

export default function TypingMessage({ text, speed = 8, onComplete, shouldStop, onUpdate }: TypingMessageProps) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        setIndex(0);
    }, [text]);

    useEffect(() => {
        if (shouldStop) {
            setIndex(text.length);
            return;
        }

        if (index < text.length) {
            const timeout = setTimeout(() => {
                setIndex(prev => prev + 1);
                onUpdate?.();
            }, speed);

            return () => clearTimeout(timeout);
        } else {
            onComplete?.();
        }
    }, [index, text]);

    return (
        <span className="ai-typing-text">
            <ReactMarkdown>
                {text.slice(0, index)}
            </ReactMarkdown>
        </span>
    );
}
