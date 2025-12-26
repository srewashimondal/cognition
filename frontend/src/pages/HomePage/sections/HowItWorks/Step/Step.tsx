import './Step.css';

type StepProps = {
    number: number;
    title: string;
    description: string;
    image: string;
};

export default function Step({ number, title, description, image }: StepProps) {
return (
    <div className="step">
    <div className="step-text">
        <p className="step-number">Step {number}</p>

        <div className="step-title">
            <h3>{title}</h3>
        </div>

        <p className="step-desc">{description}</p>
    </div>
    <div className="step-img">
        <img src={image} alt="" className="step-image" />
    </div>
    </div>
);
}
  