import './HowItWorks.css';
import Step from './Step/Step';
import temp_stock_1 from '../../../../assets/illustrations/temp-stock-1.png';
import temp_stock_2 from '../../../../assets/illustrations/temp-stock-2.png';
import temp_stock_3 from '../../../../assets/illustrations/temp-stock-3.png';


export default function HowItWorks() {
    return (
        <div className="how-it-works">
            <div className="inner">
                <div className="head">
                    <div className="left">
                        <h1>How It</h1>
                        <h1>Works</h1>
                    </div>
                    <div className="right">
                        <p>Manage your experience from start to finish, from
                        integrations to registration and from interactive
                        stage elements to post-event data, it’s all here.
                        </p>
                        <button className="cta-lm">Learn More</button>
                    </div>
                </div>
                <div className="divider" />
                <Step number={1} title={"Upload ↗"} description={"Upload your training material."} image={temp_stock_1}/>
                <div className="divider" />
                <Step number={2} title={"Engage ↗"} description={"Cognition AI learns about your products and policies."} image={temp_stock_2}/>
                <div className="divider" />
                <Step number={3} title={"Analyze ↗"} description={"Employees chat, learn, and upskill faster."} image={temp_stock_3}/>
            </div>
        </div>
    );
}