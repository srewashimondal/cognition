import './AITranscript.css';
import type { TranscriptType } from '../../../../types/Standard/TranscriptType';
import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

type AITranscriptProps = {
    transcript: TranscriptType[];
    currentTime: number;
    videoRef: RefObject<HTMLVideoElement | null>;
    isVisible: boolean;
};

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
}

export default function AITranscript({ transcript, currentTime, videoRef, isVisible }: AITranscriptProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const activeRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!isVisible) return;
        if (!containerRef.current || !activeRef.current) return;
        const container = containerRef.current;
        const active = activeRef.current;
        const containerTop = container.getBoundingClientRect().top;
        const activeTop = active.getBoundingClientRect().top;
        const scrollOffset = activeTop - containerTop + container.scrollTop;
         
        container.scrollTo({
            top: scrollOffset,
            behavior: "smooth",
        });
    }, [currentTime, isVisible]);

    return (
        <div className="ai-transcript" ref={containerRef}>
            {transcript.map((line, idx) => {
                const isActive =
                currentTime >= line.start &&
                currentTime <= line.end;


                return (
                    <div key={idx} ref={isActive ? activeRef : null} className={`transcript-line ${isActive ? 'active' : ''}`}
                    onClick={() => {if (videoRef.current) {
                    videoRef.current.currentTime = line.start;
                    videoRef.current.play();}}} >
                        <span className="timestamp">
                        {formatTime(line.start)}
                        </span>
                        <span className="text">{line.text}</span>
                    </div>
                );
            })}
        </div>
    );
};