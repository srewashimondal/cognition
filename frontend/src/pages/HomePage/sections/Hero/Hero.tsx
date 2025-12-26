import './Hero.css';

export default function Hero() {
    return(
        <div className="hero">
            <div className="slogan">
                <h1>Turn Everyday</h1>
                <h1>Training Into</h1>
                <h1 className="blue">Smart Learning.</h1>
            </div>
            <div className="desc">
                <p>Bored of long standardized retail training videos? Use Cognition.</p>
                <p>Find out more information below.</p>
            </div>
            <div className="buttons">
                <button className="cta-primary">
                    <span>Free Trial</span>
                    <span className="arrow">→</span>
                </button>

                <button className="cta-secondary">
                    <span>Book a Demo</span>
                    <span className="arrow">→</span>
                </button>
            </div>
        </div>
    );
}