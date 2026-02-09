import './HomePage.css';
import { useEffect } from 'react';
import NavBar from '../../components/NavBar/NavBar.tsx';
/*import Hero from './sections/Hero/Hero.tsx';*/
// import HowItWorks from './sections/HowItWorks/HowItWorks.tsx';
// import Features from './sections/Features/Features.tsx';

import heroImg from '../../assets/illustrations/homepage-graphics/hero-1.svg';
import sec2Employee from '../../assets/illustrations/homepage-graphics/section 2/employee-graphic.svg';
import sec2Employer from '../../assets/illustrations/homepage-graphics/section 2/employer-graphic.svg';
// import chatbarGif from '../../assets/illustrations/homepage-graphics/section 2/chatbar.gif';
import chatbarMP4 from '../../assets/illustrations/homepage-graphics/section 2/chatbar-vid.mp4';
import chatbarWebm from '../../assets/illustrations/homepage-graphics/section 2/chatbar-vid.webm';
import sec3Employer from '../../assets/illustrations/homepage-graphics/section 3/employer-lessons.svg';
import sec3Employee from '../../assets/illustrations/homepage-graphics/section 3/employee-simulations.svg';
import sec3Video1 from '../../assets/illustrations/homepage-graphics/section 3/video-1.svg';
import sec3Video2 from '../../assets/illustrations/homepage-graphics/section 3/video-2.svg';
import sec4Feature1 from '../../assets/illustrations/homepage-graphics/section 4/feature-1.svg';
import sec4Feature4 from '../../assets/illustrations/homepage-graphics/section 4/feature-4.svg';
import sec4Feature2 from '../../assets/illustrations/homepage-graphics/section 4/feature-2.svg';
import sec4Feature3 from '../../assets/illustrations/homepage-graphics/section 4/feature-3.svg';
import whiteLogo from '../../assets/branding/cognition-logo-white.svg';

export default function HomePage() {
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

    return (
        <div className="home-page">
            <div className="hero-blob" />
            <div className="bg-blobs">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
            </div>
            <NavBar />
            <Hero />
            <Section2 />
            <Section3 />
            <AdditionalFeatures />
            {/*<HowItWorks />*/}
            {/*<Features />*/}
            <Footer />
        </div>
    );
}

function Hero() {
    return (
        <section className="hero-page">
            <div className="hero-left">
               <h1>
                    Turn everyday <br />
                    training into <br />
                    <span className="hero-highlight">
                        smart learning.
                    </span>
               </h1>
               <p>
                    Bored of confusing standardized retail training <br />
                    videos? Try Cognition AI. 
                    <span> </span>
                    <span className="hero-bold">
                        Start your free trial today.
                    </span>
               </p>
               <button className="hero-cta">
                    Free Trial
                    <div className="hero-cta-circle">
                        →
                    </div>
               </button>
            </div>
            <div className="hero-right">
                <img src={heroImg} />
            </div>
        </section>
    );
}

function Section2() {
    return (
        <section className="sec2-page">
            <div className="sec2-top">
                <h4>Build confidence. Drive results.</h4>
                <h2>
                    Cognition helps employees build <br />
                    confidence while helping businesses <br />
                    see real results.
                </h2>
            </div>
            <div className="sec2-middle">
                <div className="sec2-middle-card">
                    <h3>For Employees</h3>
                    <p className="sec2-middle-card-highlight">Practice real situations before they happen.</p>
                    <p className="sec2-middle-card-description">
                        Build confidence through interactive simulations, <br />
                        guided practice, and role-specific feedback <br />
                        for real work on the floor.
                    </p>
                    <img className="sec2-employee" src={sec2Employee} />
                </div>
                <div className="sec2-middle-card right-aligned">
                    <h3>For Employers</h3>
                    <p className="sec2-middle-card-highlight">See training turn into performance.</p>
                    <p className="sec2-middle-card-description">
                        Deliver smarter onboarding and AI-powered course <br />
                        bundles to get real insight into employee readiness, <br /> 
                        skill gaps, and training effectiveness.
                    </p>
                    <div className="sec2-employer-wrapper">
                        <img className="sec2-employer" src={sec2Employer} />
                    </div>
                </div>
            </div>
            <div className="sec2-bottom">
                <div className="sec2-bottom-text">
                    <h4>
                        Meet
                        <span> </span>
                        <span className="sec2-bottom-highlight">
                            Builder Studio
                        </span>
                    </h4>
                    {/*<img src={chatbarGif} />*/}
                    <p className="sec2-middle-card-description no-margin" >Use our chatbot to describe ideas for a simulation module, and watch the magic happen.</p>
                </div>
                <video autoPlay loop muted playsInline>
                    <source src={chatbarWebm} type="video/webm" />
                    <source src={chatbarMP4} type="video/mp4" />
                </video>

            </div>
        </section>
    );
}

function Section3() {
    return (
        <section className="sec3-page">
            <div className="employer-features">
                <div className="employer-features-left">
                    <img src={sec3Employer} />
                </div>
                <div className="employer-features-right">
                    <h4>
                        <span className="h4-highlight-blue">Employers</span>
                        <span> </span>
                        can <br />
                        tailor simulations to <br />
                        their store's protocols <br />
                        with Cognition AI.
                    </h4>
                    <p className="homepage-grey-text">
                        Cognition lets employers tailor simulations <br />
                        to their store’s protocols by adjusting <br />
                        skills, evaluation criteria, and response <br />
                        expectations, so training aligns with <br />
                        real-world standards.
                    </p>
                </div>
            </div>
            <div className="employee-features">
                <div className="employee-features-left">
                    <h4>
                        <span className="h4-highlight-orange">Employees</span>
                        <span> </span>
                        can <br />
                        practice realistic <br />
                        scenarios with AI <br />
                        simulations. <br />
                    </h4>
                    <p className="homepage-grey-text">
                        AI-powered simulations adapt and  <br />
                        provide feedback to employee responses,  <br />
                        skills, evaluation criteria, and response <br />
                        helping them practice real situations and  <br />
                        refine their approach over time.
                    </p>
                </div>
                <div className="employee-features-right">
                    <img src={sec3Employee} />
                </div>
            </div>
            <div className="video-feature">
                <div className="video-feature-left">
                    <div className="video-feature-text">
                        <h4 className="h4-highlight-orange">Guided Learning Support</h4>
                        <p className="homepage-grey-text">
                            Cognition organizes training into clear sections with AI-generated <br />
                            summaries, transcripts, and a guided chat so employees can review   <br />
                            key moments and ask questions as they learn.
                        </p>
                    </div>
                    <img src={sec3Video1} />
                </div>
                <div className="video-feature-right">
                    <img src={sec3Video2} />
                </div>
            </div>
        </section>
    );
}

function AdditionalFeatures() {
    return (
        <section className="additional-features-pg">
            <h4 className="additional-features-pg-title right-text h4-highlight-blue">Additional features</h4>
            <div className="additional-features-body">
                <div className="additional-features-left">
                    <div className="column-feature">
                        <h4 className="grey-header">
                            Employee-specific analytics <br />
                            and insights
                        </h4>
                        <p className="sec2-middle-card-description">
                            Cognition provides role and employee-level insights that help 
                            employers understand progress, identify skill gaps, and support 
                            improvement beyond simple completion metrics.
                        </p>
                        <img src={sec4Feature1} />
                    </div>
                    <div className="row-feature feat4">
                        <div className="row-feature-text">
                            <h4 className="grey-header">
                                Automatic AI <br />
                                feedback
                            </h4>
                            <p className="sec2-middle-card-description">
                                Employees receive instant, actionable feedback based on their responses, helping them understand what worked, what didn’t, and how to improve.
                            </p>
                        </div>
                        <img src={sec4Feature4} />
                    </div>
                </div>
                
                <div className="additional-features-right">
                    <div className="row-feature feat2">
                        <div className="row-feature-text">
                            <h4 className="grey-header">Quiz Builder</h4>
                            <p className="sec2-middle-card-description">
                                Create flexible quizzes to reinforce learning, assess understanding, and check readiness using multiple question types and customizable settings.
                            </p>
                        </div>
                        <img src={sec4Feature2} />
                    </div>
                    <div className="column-feature right-aligned feat3">
                        <h4 className="grey-header">Standard Module Builder</h4>
                        <p className="sec2-middle-card-description">
                            Build structured training modules with videos, quizzes, and lessons that align with company policies and onboarding goals.
                        </p>
                        <img src={sec4Feature3} />
                    </div>
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <section className="homepage-footer">
            <div className="homepage-footer-left">
                <div className="footer-logo-wrapper">
                    <img src={whiteLogo} />
                    <h1>Cognition</h1>
                </div>
                <p className="footer-description">
                    Cognition is an AI-powered training platform that helps retail employees learn through realistic simulations while giving employers insight into real-world readiness and performance.
                </p>
                <p className="footer-text-small">© 2026 All rights reserved.</p>
            </div>
            <div className="homepage-footer-right">
                <div className="homepage-footer-column">
                    <p className="homepage-footer-column-title">Product</p>
                </div>
                <div className="homepage-footer-column">
                    <p className="homepage-footer-column-title">About Us</p>
                </div>
                <div className="homepage-footer-column">
                    <p className="homepage-footer-column-title">Resources</p>
                </div>
            </div>
        </section>
    );
}