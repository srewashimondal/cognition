import './StandardLessons.css';
import { useParams, useNavigate } from 'react-router-dom';
import ProgressBar from '../../../../components/ProgressBar/ProgressBar';
import EmployeeCard from '../../../../cards/StandardLesson/EmployeeCard/EmployeeCard';
import { standardModuleAttempt } from '../../../../dummy_data/standardAttempt_data';
import orange_left_arrow from '../../../../assets/icons/orange-left-arrow.svg';
import clock_icon from '../../../../assets/icons/simulations/black-clock-icon.svg';
import notebook_icon from '../../../../assets/icons/simulations/black-notebook-icon.svg';

export default function StandardLessons() {
    const navigate = useNavigate();
    const { moduleID } = useParams();
    const id = Number(moduleID);

    const moduleAttempt = standardModuleAttempt.find(m => m.moduleInfo.id === id);
    const moduleInfo = moduleAttempt?.moduleInfo;
    const lessonAttempts = moduleAttempt?.lessons;

    return (
        <div className="standard-lessons-page">
            <div className="simulation-lessons-top">
                <div className="back-to-modules" onClick={() => navigate(`/employee/standard-modules`)}>
                    <img src={orange_left_arrow} />
                </div>

                {/*<div className={`lesson-banner ${bannerColorByID[(moduleInfo?.id ?? 1) - 1]}`} />*/}
        
                <div className="modules-header lesson-pg employee">
                    <div className="modules-header-left">
                        <div className="builder-page-title">
                            Simulation Modules / Module View
                        </div>
                        <h1>{moduleInfo?.title}</h1>
                        <div className="module-meta-bottom">
                            <div className="module-meta-item">
                                <span>
                                    <img src={clock_icon} />
                                </span>
                                {moduleInfo?.hours} hrs
                            </div>
                            <div className="module-meta-item">
                                <span>
                                    <img src={notebook_icon} />
                                </span>
                                {lessonAttempts?.length} lessons
                            </div>
                        </div>
                    </div>
                    <div className="modules-header-right">
                        <ProgressBar percent={moduleAttempt?.percent ?? 0} style={true} style1={true} />
                    </div>
                </div>
            </div>
            <div className="simulation-lessons-bottom">
                <div className="lessons-list">
                    {lessonAttempts?.map((l) => (<EmployeeCard lesson={l.lessonInfo} status={l.status} />))}
                </div>
            </div>
            <div className="filler-space" />
        </div>
    );
}