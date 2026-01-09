import './LessonEditButton.css';
import white_ai_edit from '../../../assets/icons/lesson-edit/white-ai-edit.svg';
import orange_ai_edit from '../../../assets/icons/lesson-edit/orange-ai-edit.svg';
import thin_white_upload from '../../../assets/icons/lesson-edit/thin-white-upload.svg';
import thin_orange_upload from '../../../assets/icons/lesson-edit/thin-orange-upload.svg';

type LessonEditButtonProps = {
    buttonType: "ai-edit" | "upload";
    onClick?: () => void;
    selected?: boolean;
};

export default function LessonEditButton({ buttonType, onClick, selected }: LessonEditButtonProps) {
    const typeToIcon = {
        "ai-edit": {
            "default": white_ai_edit,
            "selected": orange_ai_edit
        },
        "upload": {
            "default": thin_white_upload,
            "selected": thin_orange_upload
        },
    };
    
    return (
        <button className={`lesson-edit-button ${(selected) ? "selected" : ""}`} onClick={onClick}>
            <img className="edit-button-icon default" src={typeToIcon[buttonType]["default"]}/>
            <img className="edit-button-icon selected" src={typeToIcon[buttonType]["selected"]}/>        
        </button>
    );
}