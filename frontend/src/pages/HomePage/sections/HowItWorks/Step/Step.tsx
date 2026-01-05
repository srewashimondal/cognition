import './Step.css';

type StepProps = {
    number: number;
    title: string;
    description: string;
    image: string;
};

export default function Step({ number, title, description, image }: StepProps) {
return (
    <div className="a-step">
    <div className="a-step-text">
        <p className="a-step-number">Step {number}</p>

        <div className="a-step-title">
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
  