import './ProgressBar.css';

export default function ProgressBar({ percent }: {percent: number}) {

    return (
        <div className="progress-bar-div">
            <div className="progress-bar-wrapper">
                <div className="progress-bar-fill"
                    style={{ width: `${percent}%` }} />
            </div>
            <span className="progress-label">{percent}% complete</span>
        </div>
    );
}