import './HomePage.css';
import NavBar from '../../components/NavBar/NavBar.tsx';
import Hero from './sections/Hero/Hero.tsx';
import HowItWorks from './sections/HowItWorks/HowItWorks.tsx';
import Features from './sections/Features/Features.tsx';

export default function HomePage() {
    return (
        <div className="home-page">
            <NavBar />
            <div className="bg-blobs">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
            </div>
            <Hero />
            <HowItWorks />
            <Features />
        </div>
    );
}