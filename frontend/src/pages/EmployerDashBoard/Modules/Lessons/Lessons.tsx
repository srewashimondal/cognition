import './Lessons.css';
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { modules } from '../../../../dummy_data/modules_data';
import LessonCard from '../../../../cards/LessonCard/LessonCard';
import ActionButton from '../../../../components/ActionButton/ActionButton';
import orange_left_arrow from '../../../../assets/icons/orange-left-arrow.svg';

export default function Lessons() {
  const navigate = useNavigate();
  const { id } = useParams();
  const moduleId = Number(id);

  /* replace this line with backend logic later */
  const module = modules.find(m => m.id === moduleId);

  const lessons = module?.lessons;
  const bannerColorByID = ["module1", "module2", "module3", "module4", "module5", "module6"];

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div className="lessons-page">
      <div className="back-to-modules" onClick={() => navigate(`/employer/modules`)}>
        <img src={orange_left_arrow} />
      </div>

      <div className={`lesson-banner ${bannerColorByID[(module?.id ?? 1) - 1]}`} />
      
      <div className="modules-header lesson-pg">
        <div>
          <h1>{module?.title}</h1>
          <p>View and manage your course lessons.</p>
        </div>
        <div>
          <ActionButton buttonType="deploy" text="Deploy" disabled={module?.deployed} />
        </div>
      </div>

      <div className="lessons-list-header-employer">
          <div className="list-header-section lsn">Lesson</div>
          <div className="list-header-section">{/*Filler*/}</div>
          <div className="list-header-section">Duration</div>
          <div className="list-header-section">Due Date</div>
          <div className="list-header-section">{/*Filler*/}</div>
      </div>

      <div className="lessons-list">
        {lessons?.map((l) => (<LessonCard lessonInfo={l} role={"employer"} />))}
      </div>
      <div className="filler-space">

      </div>
    </div>
  );
}
