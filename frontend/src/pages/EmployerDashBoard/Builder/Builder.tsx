import './Builder.css';
import { useParams, useNavigate } from 'react-router-dom';
import ChatBar from '../../../components/ChatBar/ChatBar';
import orange_left_arrow from '../../../assets/icons/orange-left-arrow.svg';
import ai_icon from '../../../assets/icons/simulations/grey-ai-icon.svg';

export default function Builder() {
    const navigate = useNavigate();
    const { moduleID } = useParams();
    const isNewDraft = !moduleID;

    return (
        <div className="builder-page">
            <div className="back-to-modules" onClick={() => navigate(`/employer/modules`)}>
                <img src={orange_left_arrow} />
            </div>
            <div className="builder-hero">
                <h3>Welcome To</h3>
                <h3>Builder Studio</h3>
                <div className="builder-desc">
                    <span>
                        <img src={ai_icon} />
                    </span>
                    <p>Start by pitching a Simulation Idea to Cognition AI</p>
                </div>
            </div>
            <div className="chatbar-wrapper">
                <ChatBar context="builder" />
            </div>
        </div>
    );
}