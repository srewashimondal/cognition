import './ContextItem.css';
import globe_icon from '../../../assets/icons/simulations/black-globe-icon.svg';
import cap_icon from '../../../assets/icons/simulations/black-cap-icon.svg';
import x_icon from '../../../assets/icons/simulations/grey-x-icon.svg';

type ContextItemProps = {
    label: string;
    global: boolean;
    handleRemove: () => void;
}

export default function ContextItem({ label, global, handleRemove }: ContextItemProps) {
    return (
        <div className="context-item-wrapper">
            <span>
                <img src={global ? globe_icon : cap_icon} />
            </span>
            {label}
            <span onClick={handleRemove}>
                <img src={x_icon} />
            </span>
        </div>
    );
}