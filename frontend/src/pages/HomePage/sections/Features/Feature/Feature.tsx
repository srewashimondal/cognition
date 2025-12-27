import './Feature.css'
import radio_icon from '../../../../../assets/icons/radio-icon.svg';
import blue_arrow from '../../../../../assets/icons/blue-arrow.svg';

type FeatureProps = {
    title: string;
    description: string;
    linkName: string;
    image: string;
    reverse?: boolean;
};

export default function Feature ({ title, description, linkName, image, reverse=false }: FeatureProps) {
    return (
        <div className={`feature ${reverse ? "reverse" : ""}`}>
            <div className="feat-img">
                <img src={image} alt="" className="feat-image" />
            </div>
            <div className="feat-text">
                <img src={radio_icon} alt="" className="radio-icon" />
                <h3>{ title }</h3>
                <p>{ description }</p>
                <div className="link-div">
                    <p className="cta-link">{ linkName }</p>
                    <img src={blue_arrow} alt="" className="blue-arrow" />
                </div>
            </div>
        </div>
    );
}