import './VideoLessonPage.css';
import { useState, useRef, useEffect } from 'react';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import AITranscript from './AITranscript/AITranscript';
import ChatBubble from '../../Simulation/ChatBubble/ChatBubble';
import ChatBar from '../../../components/ChatBar/ChatBar';
import type { VideoLessonType } from '../../../types/Standard/StandardLessons';
import type { MessageType } from '../../../types/Modules/Lessons/Simulations/MessageType';
import left_arrow from '../../../assets/icons/orange-left-arrow.svg';
import play_button from '../../../assets/icons/video-play-icon.svg';
import right_chevron from '../../../assets/icons/chevron-right-icon.svg';

type VideoLessonPageProps = {
    lesson: VideoLessonType;
    handleBack: () => void;
    moduleTitle: string;
};

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s
        .toString()
        .padStart(2, '0')}`;
}

export default function VideoLessonPage({ lesson, handleBack, moduleTitle }: VideoLessonPageProps) {
    const [videoURL, setVideoURL] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    // const [currentTab, setCurrentTab] = useState<Tab>("AI Transcript");
    // const [notes, setNotes] = useState("");
    const [currentTime, setCurrentTime] = useState(0);
    const [selectedSummaryIdx, setSelectedSummaryIdx] = useState<number | null>(null);
    const selectedSummary = selectedSummaryIdx !== null ? lesson?.summaries?.[selectedSummaryIdx] ?? null : null;
    const [chatMessages, setChatMessages] = useState<MessageType[]>([]); // in backend make it so there is 1 chatMessages state/list per section summary
    const [userInput, setUserInput] = useState("");
    const [showTranscript, setShowTranscript] = useState(false);
    /* const lessonId = lesson.id;
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [generatedSummaries, setGeneratedSummaries] = useState(lesson.summaries ?? []);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [transcriptData, setTranscriptData] = useState([]);
    const [videoDuration, setVideoDuration] = useState(0);
    */
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

    useEffect(() => {
        async function fetchVideoURL() {
          if (!lesson?.videoFilePath) return;
      
          try {
            const storage = getStorage();
            const storageRef = ref(storage, lesson.videoFilePath);
            const url = await getDownloadURL(storageRef);
            setVideoURL(url);
          } catch (err) {
            console.error("Error fetching video URL:", err);
          }
        }
      
        fetchVideoURL();
    }, [lesson]);
      
    
    const handlePlay = () => {
        videoRef.current?.play();
        setIsPlaying(true);
    };

    const handleSend = () => {
        if (!userInput.trim()) return;

        setChatMessages(prev => {
            const lastId = prev.length > 0 ? prev[prev.length - 1].id : 0;

            const newMessage: MessageType = {
                id: lastId + 1,
                role: "user",
                content: userInput,
            };

            return [...prev, newMessage];
        });
        setUserInput("");
    };

    const transcriptRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (!selectedSummaryIdx) return;
      
        requestAnimationFrame(() => {
          const el = transcriptRef.current;
          if (!el) return;
      
          el.scrollTop = el.scrollHeight;
        });
    }, [selectedSummaryIdx]);

    useEffect(() => {
        const el = transcriptRef.current;
        if (!el) return;
      
        el.scrollTop = el.scrollHeight;
    }, [chatMessages]);

    /*const generateAISummaries = async () => {

        try {
            setIsGeneratingAI(true);
            setErrorMessage(null);

            const payload = {
                lesson_id: "oahhToo3UsqgrYb9OOqt",
                video_path: "trainingVideos/video1.mp4",
            };


            console.log("Generating AI summaries with payload:", payload);

            const response = await fetch("http://localhost:8000/ai/generate-video-summary", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("AI summaries generated:", data);

            if (data.sections) {
                setGeneratedSummaries(data.sections);
                setErrorMessage(null);
            }

        } catch (error) {
            console.error("Error generating AI summaries:", error);
            setErrorMessage(
                error instanceof Error 
                    ? `Failed to generate summaries: ${error.message}`
                    : "An unexpected error occurred while generating summaries"
            );
        } finally {
            setIsGeneratingAI(false);
        }
    }; */

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

                    <video ref={videoRef} src={videoURL ?? ""} controls={isPlaying} preload="metadata" 
                    onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} 
                    onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)} />

                    {!isPlaying && (
                        <img className="play-button for-video" src={play_button} onClick={handlePlay} />
                    )}

                </div>
                {/*<div className="video-under">
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
                </div> */}
            </div>
            <div className="section-summaries">
                {(selectedSummary) ? 
                <div className="selected-summary-chat">
                    <div className="back-to-lessons" onClick={() => setSelectedSummaryIdx(null)}>
                        <img src={left_arrow} />
                    </div>
                    <div className="summary-left">
                        <div className="summary-number">{(selectedSummaryIdx ?? 0) + 1}</div>
                        <div className="summary-title">
                            {selectedSummary.title} ({formatTime(selectedSummary.start)}-{formatTime(selectedSummary.end)})
                        </div>
                    </div>
                    <div className="ai-panel-chat-space" ref={transcriptRef}>
                        <ChatBubble key={selectedSummary.id} message={selectedSummary.canonicalSummary} 
                        className={"first-message"}
                        />
                        {chatMessages.length === 0 && <div className="scroll-spacer" />}
                        {chatMessages.map((m, i, arr) => 
                        <ChatBubble key={m.id} message={m} className={i === arr.length - 1 ? "last-message" : i === 0 ? "first-message": ""} />)}    
                    </div>
                    <div className="builder-chat-wrapper">
                        <ChatBar context={"summary"} userInput={userInput} setUserInput={setUserInput} 
                        handleSend={handleSend} />
                    </div>
                </div>
                : 
                <>
                <div className="ai-side-title">Section-based AI Summaries</div>
                {lesson.summaries?.map((s, i) => 
                    <div className="summary-tab" 
                        onClick={() => {
                            if (videoRef.current) {
                                videoRef.current.currentTime = s.start;
                                videoRef.current.play();
                                setSelectedSummaryIdx(i);
                                setIsPlaying(true);}
                        }}
                    >
                        <div className="summary-left">
                            <div className="summary-number">{i + 1}</div>
                            <div className="summary-title">
                                {s.title} ({formatTime(s.start)}-{formatTime(s.end)})
                            </div>
                        </div>
                        <div>
                            <img src={right_chevron} />
                        </div>
                    </div>
                )}
                { (showTranscript) ?
                    <>
                        <div className="ai-side-title smaller">
                            AI Transcript
                            <button className="view-transcript-btn" type="button" onClick={() => setShowTranscript(false)}>
                                Hide Transcript
                            </button>
                        </div>
                        <div className="ai-transcript-wrapper">
                            <AITranscript transcript={lesson.transcript ?? []} currentTime={currentTime} videoRef={videoRef} 
                            isVisible={showTranscript}/> {/* isVisible={currentTab === "AI Transcript"} */}
                        </div> 
                    </>:
                    <div className="view-transcript-btn-wrapper">
                        <button className="view-transcript-btn" type="button" onClick={() => setShowTranscript(true)}>
                            View Transcript
                        </button>
                    </div>
                }
                </>
                }
            </div>
        </div>
    );
}