import './SimulationPage.css';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VoiceMode from './VoiceMode/VoiceMode';
import TypeMode from './TypeMode/TypeMode';
import Assistant from './Assistant/Assistant';
// dummy data
import { moduleAttempts } from '../../dummy_data/modulesAttempt_data';

export default function SimulationPage() {
    const { moduleID, lessonID, simIdx } = useParams();
    const moduleId = Number(moduleID);
    const lessonId = Number(lessonID);
    const simulationIndex = Number(simIdx) - 1;

    const moduleAttempt = moduleAttempts.find(m => m.moduleInfo.id === moduleId);
    const lessonAttempts = moduleAttempt?.lessons;
    const lessonAttempt = lessonAttempts?.find(l => l.lessonInfo.id === lessonId);
    const lessonTitle = lessonAttempt?.lessonInfo.title;
    const simAttempt = lessonAttempt?.simulations?.[simulationIndex];
    const simInfo = simAttempt?.simulationInfo; // contains character name and sim premise
    const messages = simAttempt?.messages;

    const [voiceMode, setVoiceMode] = useState(true);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

    const navigate = useNavigate();
    const handleBack = () => {
        navigate(`/employee/simulations/${moduleID}`);
    };

    return (
        <div className="simulation-page">
            <div className="chat-section">
                {(voiceMode) ?
                (<VoiceMode title={lessonTitle ?? ""} idx={simulationIndex + 1} 
                messages={messages ?? []} switchType={() => setVoiceMode(false)}
                handleBack={handleBack} />) :
                (<TypeMode title={lessonTitle ?? ""} idx={simulationIndex + 1} 
                messages={messages ?? []} switchType={() => setVoiceMode(true)}
                handleBack={handleBack} />)
                }
            </div>
            <div className="sim-info">
                <h3>Meet {simInfo?.characterName}</h3>
                <p>Scenario Premise: {simInfo?.premise}</p>
                <p className="sim-prompt">How would you approach this situation?</p>
                <Assistant messages={messages ?? []} />
            </div>
        </div>
    );
}