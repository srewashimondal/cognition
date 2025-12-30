import './AIStudio.css';
import AIStudioAssignments from './AIStudioAssignments/AIStudioAssignments';

import { useState } from "react";

type Module = {
  id: number;
  title: string;
  subtitle: string;
  thumbnail: string;
  duration: string;
  lessons: string;
};


const initialModules: Module[] = [
  {
    id: 1,
    title: "Color Styles - 02",
    subtitle: "Learn about colors, contrast & color styles",
    thumbnail: "https://cdn.britannica.com/62/234462-050-6CDEB78F/color-wheels-RYB-RGB.jpg",
    duration: "3 hours",
    lessons: "8 Lessons",
  },
  {
    id: 2,
    title: "Design Thinking",
    subtitle: "UXM Project Workbook",
    thumbnail: "https://i0.wp.com/makenstitch.com/wp-content/uploads/Christmas-embroidery-designs-intro.jpg?resize=720%2C720&ssl=1",
    duration: "2 hours",
    lessons: "6 Lessons",
  },
  {
    id: 3,
    title: "Visual Design Briefs",
    subtitle: "Constructing visual design from briefs",
    thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRNDI965qIwKZU8asFrBIG6bzuxyniWcSZbg&s",
    duration: "3 hours",
    lessons: "8 Lessons",
  },
];

export default function AIStudio() {
  const [modules, setModules] = useState(initialModules);

  const handleEdit = (id: number) => {
    const newTitle = prompt("Enter new module title:");
    if (!newTitle) return;

    setModules((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, title: newTitle } : m
      )
    );
  };

  return (
    <div className="modules-page">
      <div className="modules-header">
        <h2>AI Studio</h2>
      </div>

      <div className="modules-grid">
        {modules.map((module) => (
          <div key={module.id} className="module-card">
            <div className="module-thumb">
              <img src={module.thumbnail} alt={module.title} />
              <button
                className="edit-btn"
                onClick={() => handleEdit(module.id)}
              >
                ✎ Edit
              </button>
            </div>

            <div className="module-content">
              <h3>{module.title}</h3>
              <p>{module.subtitle}</p>

              <div className="module-meta">
                <span>{module.duration}</span>
                <span>{module.lessons}</span>
              </div>

              <div className="module-actions">
                <button className="watch">▶ View Assignments</button>
                <button className="download">⬇ Download</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
