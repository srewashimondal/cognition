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
import { getAuth } from "firebase/auth";
const auth = getAuth();
const user = auth.currentUser;
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from '../../../firebase';


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

    useEffect(() => {
        async function loadChat() {
            if (!selectedSummary) return;

            const messagesRef = collection(
                db,
                "standardLessons",
                lesson.id,
                "sectionChats",
                String(selectedSummaryIdx), 
                "messages"
            );

            const q = query(messagesRef, orderBy("timestamp", "asc"));
            const snapshot = await getDocs(q);

            const loadedMessages: MessageType[] = snapshot.docs.map((docSnap, index) => {
                const data = docSnap.data();
                return {
                    id: index + 1,
                    role: data.role,
                    content: data.content,
                };
            });

            setChatMessages(loadedMessages);
        }

        loadChat();
    }, [selectedSummary]);


   
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

    const handleSend = async () => {
        if (!userInput.trim() || !selectedSummary) return;

        const newUserMessage: MessageType = {
            id: Date.now(),
            role: "user",
            content: userInput,
        };

        setChatMessages(prev => [...prev, newUserMessage]);

        const messageToSend = userInput;
        setUserInput("");

        try {
            const res = await fetch("http://127.0.0.1:8000/ai/section-chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    lesson_id: lesson.id,
                    section_id: selectedSummary.id,
                    user_message: messageToSend,
                }),
            });

            const data = await res.json();

            const aiMessage: MessageType = {
                id: Date.now() + 1,
                role: "assistant",
                content: data.response,
            };

            setChatMessages(prev => [...prev, aiMessage]);

        } catch (err) {
            console.error("Chat error:", err);
        }
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


    return (
        <div className="video-lesson-page">
            <div className="video-portion">
                <div className="video-lesson-header">
                    <div className="back-to-lessons" onClick={handleBack}>
                        <img src={left_arrow} />
                    </div>
                    <div className="builder-page-title">
                        Simulation Modules / {moduleTitle} / Video Lesson
                    </div>
                </div>
                <div className="video-title">
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
            { (lesson?.allowSummary || lesson?.allowTranscript) &&
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
                { lesson.allowSummary &&
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
                    </>}
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
                        { lesson.allowTranscript &&
                        <button className="view-transcript-btn" type="button" onClick={() => setShowTranscript(true)}>
                            View Transcript
                        </button>}
                    </div> 
                }
                </>
                }
            </div> }
        </div>
    );
}