import './TypingMessage.css';
import { useEffect, useState, useRef } from "react";

type TypingMessageProps = {
    text: string;
    speed?: number; 
    onComplete?: () => void;
};

export default function TypingMessage({ text, speed=8, onComplete }: TypingMessageProps) {
    const [displayed, setDisplayed] = useState("");
    const indexRef = useRef(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setDisplayed("");
        indexRef.current = 0;

        const type = () => {
            if (indexRef.current < text.length) {
            setDisplayed(prev => prev + text[indexRef.current]);
            indexRef.current++;

            timeoutRef.current = setTimeout(type, speed);
            } else {
                onComplete?.();
            }
        };

        type();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [text]);

    return (
        <span className="ai-typing-text">
            {displayed}
            <span className="cursor" />
        </span>
    );
}
