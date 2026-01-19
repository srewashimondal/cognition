import './AttachmentItem.css';
import pdf_icon from '../../assets/icons/chatbar/small-pdf-icon.svg';
import x_icon from '../../assets/icons/simulations/grey-x-icon.svg';

type AttachmentItemProps = {
    fileName: string; // change later
    onClick?: () => void;
};

export default function AttachmentItem({ fileName, onClick }: AttachmentItemProps) {
    return (
        <div className="attachment-item">
            <span className="attached-file-icon">
                <img src={pdf_icon} />
            </span>
            <span>
                {fileName.replace(/\s+/g, "")}.pdf
            </span>
            <span className="x-icon" onClick={onClick}>
                <img src={x_icon} />
            </span>
        </div>
    );
}