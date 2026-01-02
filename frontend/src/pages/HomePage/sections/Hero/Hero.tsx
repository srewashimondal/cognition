import './Hero.css';
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="hero">
      {/* Headline */}
      <h1 className="hero-title">
        Turn Everyday <br />
        Training Into <br />
        <span className="hero-highlight">Smart Learning.</span>
      </h1>

      {/* Description */}
      <div className="desc">
        <p>Bored of long standardized retail training videos? Use Cognition.</p>
        <p>Find out more information below.</p>
      </div>

      {/* CTA Buttons */}
      <div className="buttons">
        <Link to='/employer-onboarding'>
        <button className="cta-primary">
          <span>Free Trial</span>
          <span className="arrow">→</span>
        </button>
        </Link>

        <button className="cta-secondary">
          <span>Book a Demo</span>
          <span className="arrow">→</span>
        </button>
      </div>
    </section>
  );
}
