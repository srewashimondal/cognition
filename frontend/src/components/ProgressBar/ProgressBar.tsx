import './ProgressBar.css';

export default function ProgressBar({ percent, style }: {percent: number, style?: boolean}) {

    return (
        <div className="progress-bar-div">
            <div className={`progress-bar-wrapper ${(style) ? "styled" : ""}`}>
                <div className={`progress-bar-fill ${(style) ? "styled" : ""}`}
                    style={{ width: `${percent}%` }} />
            </div>
            <span className="progress-label">{percent}% complete</span>
        </div>
    );
}