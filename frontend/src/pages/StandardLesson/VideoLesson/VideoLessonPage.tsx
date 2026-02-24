import './VideoLessonPage.css';
import { useState, useRef, useEffect } from 'react';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import AITranscript from './AITranscript/AITranscript';
import ChatBubble from '../../Simulation/ChatBubble/ChatBubble';
import ChatBar from '../../../components/ChatBar/ChatBar';
import type { StandardLessonAttempt } from '../../../types/Standard/StandardAttempt';
import type { VideoLessonType } from '../../../types/Standard/StandardLessons';
import type { MessageType } from '../../../types/Modules/Lessons/Simulations/MessageType';
import left_arrow from '../../../assets/icons/orange-left-arrow.svg';
import play_button from '../../../assets/icons/video-play-icon.svg';
import right_chevron from '../../../assets/icons/chevron-right-icon.svg';
import { getAuth } from "firebase/auth";
const auth = getAuth();
import { collection, query, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from '../../../firebase';



type VideoLessonPageProps = {
    lessonAttempt: StandardLessonAttempt;
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

export default function VideoLessonPage({ lessonAttempt, lesson, handleBack, moduleTitle }: VideoLessonPageProps) {
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
    const [currentUser, setCurrentUser] = useState(auth.currentUser);
    const [isLoading, setIsLoading] = useState(false);
    const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
    const [stopTyping, setStopTyping] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => setCurrentUser(u));
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        async function loadChat() {
            if (!selectedSummary || !currentUser?.uid) return;

            const messagesRef = collection(
                db,
                "standardLessonAttempts",
                lessonAttempt.id,
                "sectionChats",
                String(selectedSummary.id),
                "messages"
            );

            const q = query(messagesRef, orderBy("timestamp", "asc"));
            const snapshot = await getDocs(q);

            const loadedMessages: MessageType[] = snapshot.docs.map((docSnap, index) => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
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
            id: String(Date.now()),
            role: "user",
            content: userInput,
        };

        setChatMessages(prev => [...prev, newUserMessage]);
        setUserInput("");
        setIsLoading(true); 

        try {
            const res = await fetch("http://127.0.0.1:8000/ai/section-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lesson_attempt_id: lessonAttempt.id,
                    lesson_id: lesson.id,
                    user_id: currentUser?.uid,
                    section_id: selectedSummary.id,
                    user_message: userInput, 
                }),
            });

            const data = await res.json();

            const aiId = String(Date.now() + 1);
            const aiMessage: MessageType = {
                id: aiId,
                role: "assistant",
                content: data.response,
            };

            setChatMessages(prev => [...prev, aiMessage]);
            setTypingMessageId(aiId);
            setStopTyping(false);

        } catch (err) {
            console.error("Chat error:", err);
        } finally {
            setIsLoading(false); 
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

    const handleRegenerate = async () => {
        if (!selectedSummary) return;
    
        const lastUserMessage = [...chatMessages]
            .reverse()
            .find(m => m.role === "user");
    
        if (!lastUserMessage) return;
    
        const lastAssistant = [...chatMessages]
            .reverse()
            .find(m => m.role === "assistant");
    
        if (!lastAssistant) return;
    
        try {
            await deleteDoc(
                doc(
                    db,
                    "standardLessonAttempts",
                    lessonAttempt.id,
                    "sectionChats",
                    String(selectedSummary.id),
                    "messages",
                    lastAssistant.id
                )
            );
            
            setChatMessages(prev =>
                prev.filter(m => m.id !== lastAssistant.id)
            );
    
            setIsLoading(true);
            const res = await fetch("http://127.0.0.1:8000/ai/section-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lesson_attempt_id: lessonAttempt.id,
                    lesson_id: lesson.id,
                    user_id: currentUser?.uid,
                    section_id: selectedSummary.id,
                    user_message: lastUserMessage.content,
                }),
            });
    
            const data = await res.json();
    
            const aiId = String(Date.now() + 1);
    
            const aiMessage: MessageType = {
                id: aiId,
                role: "assistant",
                content: data.response,
            };
    
            setChatMessages(prev => [...prev, aiMessage]);
            setTypingMessageId(aiId);
            setStopTyping(false);
    
        } catch (err) {
            console.error("Regenerate error:", err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const lastMessage = chatMessages[chatMessages.length - 1];
    const canRegenerate = typingMessageId === null && !isLoading && lastMessage?.role === "assistant";

    const scrollToBottom = () => {
        const el = transcriptRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    };
    
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
                        {chatMessages.map((m, i, arr) => {
                            const isLast = i === arr.length - 1;
                            const shouldType = m.role === "assistant" && m.id === typingMessageId;
                            return (<ChatBubble key={m.id} message={m} shouldType={shouldType} stopTyping={stopTyping} onTypingComplete={() => {setTypingMessageId(null); setStopTyping(false);}}
                            className={isLast ? "last-message" : i === 0 ? "first-message" : ""} shouldRegenerate={isLast && canRegenerate} handleRegenerate={handleRegenerate} onTypingUpdate={scrollToBottom}/>)}
                        )}

                        {isLoading && (
                            <div className="chat-bubble-wrapper assistant">
                                <span className="role-text">Cognition</span>
                                <div className="chat-bubble assistant loading-bubble">
                                    <div className="spinner" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="builder-chat-wrapper">
                        <ChatBar context={"summary"} userInput={userInput} setUserInput={setUserInput} 
                        handleSend={handleSend} typingMessageId={typingMessageId} handleStop={() => {setStopTyping(true); setTypingMessageId(null);}}/>
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