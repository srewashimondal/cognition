import './ActionButton.css';
import white_play_icon from '../../assets/icons/actions/white-play-icon.svg';
import orange_play_icon from '../../assets/icons/actions/orange-play-icon.svg';
import white_save_icon from '../../assets/icons/actions/white-save-icon.svg';
import orange_save_icon from '../../assets/icons/actions/orange-save-icon.svg';
import white_refresh_icon from '../../assets/icons/actions/white-refresh-icon.svg';
import orange_refresh_icon from '../../assets/icons/actions/orange-refresh-icon.svg';
import white_rocket_icon from '../../assets/icons/white-rocket-icon.svg';
import orange_rocket_icon from '../../assets/icons/orange-rocket-icon.svg';

type ActionButtonProps = {
    text: string;
    buttonType: "play" | "save" | "refresh" | "deploy";
    onClick?: () => void; 
    selected?: boolean;
    disabled?: boolean;
    reversed?: boolean;
}

export default function ActionButton({ text, buttonType, onClick, selected=false, disabled=false, reversed=false }: ActionButtonProps) {    
    const typeToIcon = {
        "play": {
            "default": white_play_icon,
            "hover": orange_play_icon,
        },
        "save": {
            "default": white_save_icon,
            "hover": orange_save_icon
        },
        "refresh": {
            "default": white_refresh_icon,
            "hover": orange_refresh_icon
        },
        "deploy": {
            "default": white_rocket_icon,
            "hover": orange_rocket_icon
        }
    }

    return (
        <button type="button" className={`action-button ${buttonType} ${(selected) ? "selected": ""} ${disabled ? "disabled" : ""} ${(reversed ? "reversed" : "")}`} onClick={onClick}>
            {(!disabled) &&
            <div className="an-action-swap">
                <img className={`an-action-icon ${reversed ? "hover" : "default"}`} src={typeToIcon[buttonType]["default"]}/>
                <img className={`an-action-icon ${reversed ? "default" : "hover"}`} src={typeToIcon[buttonType]["hover"]}/>
            </div>}
            <span className="action-text">{`${text}${disabled ? "ed" : ""}`}</span>
        </button>
    );
}