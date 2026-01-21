import './ProgressBar.css';

export default function ProgressBar({ percent, style, style1 }: {percent: number, style?: boolean, style1?: boolean}) {

    return (
        <div className="progress-bar-div">
            <div className={`progress-bar-wrapper ${(style) ? "styled" : ""}`}>
                <div className={`progress-bar-fill ${(style) ? "styled" : ""} ${(style1) ? "styled1" : ""}`}
                    style={{ width: `${percent}%` }} />
            </div>
            <span className="progress-label">{percent}% complete</span>
        </div>
    );
}