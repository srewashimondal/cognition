import './ErrorMessage.css';

type ErrorMessageProp = {
    message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProp) {
    return (
        <div className="error-message">
            <p className="message-text">{message}</p>
        </div>
    );
}