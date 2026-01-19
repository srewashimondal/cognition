import './SimulationPage.css';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VoiceMode from './VoiceMode/VoiceMode';
import TypeMode from './TypeMode/TypeMode';
import ActionButton from '../../components/ActionButton/ActionButton';
// dummy data
import { moduleAttempts } from '../../dummy_data/modulesAttempt_data';
import black_lines_icon from '../../assets/icons/simulations/black-lines-icon.svg';
import black_ai_icon from '../../assets/icons/simulations/black-ai-icon.svg';
import grey_lines_icon from '../../assets/icons/simulations/grey-lines-icon.svg';
import grey_ai_icon from '../../assets/icons/simulations/grey-ai-icon.svg';
import message_icon from '../../assets/icons/simulations/message-icon.svg';
import blue_trend_icon from '../../assets/icons/simulations/blue-trending-up-icon.svg';

export default function SimulationPage() {
    const { moduleID, lessonID, simIdx } = useParams();
    const moduleId = Number(moduleID);
    const lessonId = Number(lessonID);
    const simulationIndex = simIdx !== undefined ? Number(simIdx) - 1 : 0;

    const moduleAttempt = moduleAttempts.find(m => m.moduleInfo.id === moduleId);
    const lessonAttempts = moduleAttempt?.lessons;
    const lessonAttempt = lessonAttempts?.find(l => l.lessonInfo.id === lessonId);
    const lessonTitle = lessonAttempt?.lessonInfo.title;
    const simAttempt = lessonAttempt?.simulations?.[simulationIndex];
    const simInfo = simAttempt?.simulationInfo; // contains character name and sim premise
    const messages = simAttempt?.messages;

    const [voiceMode, setVoiceMode] = useState(true);
    const [selectOption, setSelectOption] = useState<"premise" | "feedback">("premise");
    const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
    const messageInfo = selectedMessage !== null ? (messages?.find(m => selectedMessage === m.id)) ?? null : null;
    const feedbackInfo = selectedMessage !== null ? (messages?.find(m => selectedMessage === m.replyToId)) ?? null : null;

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

    const navigate = useNavigate();
    const handleBack = () => {
        navigate(`/employee/simulations/${moduleID}`);
    };

    const handleNext = () => {
        navigate(`/employee/simulations/${moduleID}/${lessonID}/${simulationIndex + 2}`);
    };

    const handleRead = () => {
        /* Nothing for now */
    };

    return (
        <div className="simulation-page">
            <div className="chat-section">
                {(voiceMode) ?
                (<VoiceMode key={`voice-${simulationIndex}`} title={lessonTitle ?? ""} idx={simulationIndex + 1} 
                messages={messages ?? []} switchType={() => setVoiceMode(false)}
                handleBack={handleBack} handleClick={(messageID: number) => {setSelectedMessage(messageID); setSelectOption("feedback");}} /> ) :
                (<TypeMode key={`type-${simulationIndex}`} title={lessonTitle ?? ""} idx={simulationIndex + 1} 
                messages={messages ?? []} switchType={() => setVoiceMode(true)}
                handleBack={handleBack} handleClick={(messageID: number) => {setSelectedMessage(messageID); setSelectOption("feedback");}} />)
                }
            </div>

            <div className="sim-info">
                <div className="info-body">
                    <div className={`select-panel ${selectOption}`}>
                        <div className="select-option premise" onClick={() => setSelectOption("premise")}>
                            <div className="select-swap">
                                <img className={`select-icon premise ${selectOption === "premise" && "selected"}`} src={black_lines_icon} />
                                <img className={`select-icon premise ${selectOption !== "premise" && "unselected"}`} src={grey_lines_icon} />
                            </div>
                            <p>Premise</p>
                        </div>
                        <div className="select-option feedback" onClick={() => setSelectOption("feedback")}>
                            <div className="select-swap">
                                <img className={`select-icon feedback ${selectOption === "feedback" && "selected"}`} src={black_ai_icon} />
                                <img className={`select-icon feedback ${selectOption !== "feedback" && "unselected"}`} src={grey_ai_icon} />
                            </div>
                            <p>Feedback</p>
                        </div>
                        <div className="selector" />
                    </div>
                        { (selectOption === "premise") ? 
                            (<div className="premise-info">
                                <h3>Meet {simInfo?.characterName}</h3>
                                <p><span className="sim-prompt">Scenario Premise: </span> {simInfo?.premise}</p>
                                <p className="sim-prompt">How would you approach this situation?</p>
                            </div>) : 
                            (messageInfo ? 
                                (<div className="feedback-info">
                                    <div className="score-section">
                                        <p>Overall Score</p>
                                        <div className="rating-section">
                                            <span className="msg-icon">
                                                <img src={message_icon} />
                                            </span>
                                            <h3>{feedbackInfo?.rating}/10</h3>
                                        </div>
                                        <div className="score-divider" />
                                        <p className="score-content">{feedbackInfo?.content}</p>
                                    </div>
                                    <div className="suggestion-section">
                                        <div className="current-msg-wrapper">
                                            <div className="current-msg">
                                                <div className="current-msg-content">
                                                    {messageInfo?.content}
                                                </div>
                                            </div>
                                            <div className="msg-label">Current</div>
                                        </div>
                                        <div className="suggesiton-thread-wrapper">
                                            <div className="suggestion-thread-line" />
                                        </div>
                                        <div className="improved-msg-wrapper">
                                            <div className="improved-msg">
                                                <div className="blue-thing" />
                                                <div className="improved-msg-content">
                                                    {feedbackInfo?.improved}
                                                </div>
                                            </div>
                                            <div className="msg-label">
                                                <span className="trend-icon">
                                                    <img src={blue_trend_icon} />
                                                </span>
                                                Improved
                                            </div>
                                        </div>
                                    </div>
                            </div>): (<div className="feedback-info empty">
                                Select a message you sent to view feedback.
                            </div>)) 
                        }
                </div>
                <div className="sim-action-panel">
                    <ActionButton text={"View Reference Materials"} buttonType={"read"} onClick={handleRead} />
                    {(simulationIndex < 2) && <ActionButton text={"Next Part"} buttonType={"play"} onClick={handleNext} />}
                </div>
            </div>
            
        </div>
    );
}