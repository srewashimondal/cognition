import './ChoiceItem.css';
import { Tooltip } from "@radix-ui/themes";
import white_check from '../../../assets/icons/white-check.svg';
import trash_icon from '../../../assets/icons/simulations/grey-trash-icon.svg';

type ChoiceItemProps = {
    id: number;
    content: string;
    isCorrect: boolean;
    onSelect: (id: number) => void;
    onUpdate: (id: number, value: string) => void;
    onDelete: (id: number) => void;
};

export default function ChoiceItem({ id, content, isCorrect, onSelect, onUpdate, onDelete }: ChoiceItemProps) {
    return (
        <div className="choice-item">
            <div className={`check-choice ${isCorrect ? "selected" : ""}`} onClick={() => onSelect(id)}>
                <img src={white_check} />
            </div>
            <div className="choice-text-wrapper">
                <input type="text" placeholder="Enter choice" value={content} onChange={(e) => onUpdate(id, e.target.value)} />
            </div>
            <div />
            <Tooltip content="Delete choice">
                <div className="delete-choice" onClick={() => onDelete(id)}>
                    <img src={trash_icon} />
                </div>
            </Tooltip>
        </div>
    );
};