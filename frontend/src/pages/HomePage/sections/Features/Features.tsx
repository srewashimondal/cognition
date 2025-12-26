import './Features.css';
import Feature from './Feature/Feature.tsx';
import Feature2 from './Feature2/Feature2.tsx';
import temp_stock_4 from '../../../../assets/illustrations/temp-stock-4.png';
import temp_stock_5 from '../../../../assets/illustrations/temp-stock-5.png';
import integrations from '../../../../assets/illustrations/integrations.png';
import temp_calendar from '../../../../assets/illustrations/temp-calendar.png';
import temp_notif from '../../../../assets/illustrations/temp-notif.png';


export default function Features() {
    return (
        <div className="features">
            <div className="feat-inner">
                <Feature title={"Add Subtitles with a Single Click"} description={"Use our AI automatic subtitling tool to transcribe your training video's audio to text in just a few seconds."} linkName={"Discover Auto Subtitles"} image={temp_stock_4}/>
                <Feature title={"Understand the Store Map Layout"} description={"Employers upload maps onto our platform. What better way to learn training wiht map layouts included?"} linkName={"Discover Map Layouts"} image={temp_stock_5} reverse={true}/>
                <div className="big">
                    <div className="big-text">
                        <h2>Integrating</h2>
                        <h2>With Other</h2>
                        <h2>Platforms</h2>
                        <h3>Got a Whole Lot Easier...</h3>
                    </div>
                    <div className="big-img">
                        <img src={ integrations } className="big-image"/>
                    </div>
                </div>
                <div className="other-feats">
                    <Feature2 title={"Connect Calendars"} description={"Cognition helps checks for conflicts across all of your calendars and only offers times that are open. Never get double booked again."} image={temp_calendar}/>
                    <Feature2 title={"Workflow Automation"} description={"Cognition enables you to build processes around your events. Notifications, reminders and follow ups are automatically taken care of."} image={temp_notif} resize={true}/>
                </div>
            </div>
        </div>
    );
}