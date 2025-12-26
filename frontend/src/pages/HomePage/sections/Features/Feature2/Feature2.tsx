import './Feature2.css';

type Feature2Props = {
    title: string;
    description: string;
    image: string;
    resize?: boolean;
};

export default function Feature2({ title, description, image, resize=false }: Feature2Props) {
    return (
        <div className="feature-2">
            <h3>{ title }</h3>
            <img className={`feat2-image ${resize ? "resize" : ""}`} src={ image }/>
            <div className="dashed-divider" />
            <p>{ description }</p>
        </div>
    );
}