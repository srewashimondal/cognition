import './VideoLessonPage.css';
import { useState, useRef } from 'react';
import AITranscript from './AITranscript/AITranscript';
import type { VideoLessonType } from '../../../types/Standard/StandardLessons';
import video_test from '../../../assets/videos/video_test.mp4';
import left_arrow from '../../../assets/icons/orange-left-arrow.svg';
import play_button from '../../../assets/icons/video-play-icon.svg';

type VideoLessonPageProps = {
    lesson: VideoLessonType;
    handleBack: () => void;
    moduleTitle: string;
};

type Tab = "AI Transcript" | "Notes";

export default function VideoLessonPage({ lesson, handleBack, moduleTitle }: VideoLessonPageProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTab, setCurrentTab] = useState<Tab>("AI Transcript");
    const [notes, setNotes] = useState("");
    const [currentTime, setCurrentTime] = useState(0);

    const handlePlay = () => {
        videoRef.current?.play();
        setIsPlaying(true);
    };

    return (
        <div className="video-lesson-page">
            <div className="video-portion">
                <div className="back-to-lessons" onClick={handleBack}>
                    <img src={left_arrow} />
                </div>
                <div className="video-title">
                    <div className="builder-page-title">
                            Simulation Modules / {moduleTitle} / Video Lesson
                    </div>
                    <h1>{lesson?.title}</h1>
                </div>
                <div className="video-wrapper">

                    <video ref={videoRef} src={video_test} controls={isPlaying} preload="metadata" 
                    onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} 
                    onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)} />

                    {!isPlaying && (
                        <img className="play-button for-video" src={play_button} onClick={handlePlay} />
                    )}

                </div>
                <div className="video-under">
                    <div className="video-under-tabs">
                        <div className={`video-under-tab ${currentTab === "AI Transcript" ? "active" : ""}`} onClick={() => setCurrentTab("AI Transcript")}>
                            AI Transcript
                        </div>
                        <div className={`video-under-tab ${currentTab === "Notes" ? "active" : ""}`} onClick={() => setCurrentTab("Notes")}>
                            Notes
                        </div>
                    </div>
                    <div className="video-under-content">
                        { (currentTab) === "Notes" ?
                            <div className="video-under-notes">
                                <textarea placeholder="Record notes here" value={notes} 
                                onChange={(e) => setNotes(e.target.value)}/>
                            </div> :
                            <AITranscript transcript={lesson.transcript ?? []} currentTime={currentTime} videoRef={videoRef} 
                            isVisible={currentTab === "AI Transcript"} />
                        }
                    </div>
                </div>
            </div>
            <div className="section-summaries">
            </div>
        </div>
    );
}