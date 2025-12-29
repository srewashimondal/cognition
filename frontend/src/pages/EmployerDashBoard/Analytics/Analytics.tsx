import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useState } from "react";

//To Do
  const initialTodos = [
  {
    id: 1,
    title: "Role Responsibilities",
    date: "Tuesday, 30 June 2025",
    completed: false,
  },
  {
    id: 2,
    title: "Workplace Policies",
    date: "Monday, 24 June 2025",
    completed: false,
  },
  {
    id: 3,
    title: "Retail Basics 101",
    date: "Friday, 10 June 2025",
    completed: true,
  },
  {
    id: 4,
    title: "Handling Objections",
    date: "Friday, 05 June 2025",
    completed: true,
  },
  ];

  

export default function Analytics() {
  const MAX_HOURS = 80;
  const MAX_BAR_HEIGHT = 100; 

  const getHeight = (value: number) =>
  `${(value / MAX_HOURS) * MAX_BAR_HEIGHT}px`;

  //To-Do
  const [todos, setTodos] = useState(initialTodos);

  const toggleTodo = (id: number) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  };

  return (
    <>
      <h2>Employee Name: John Doe</h2>

      <div className="dashboard-row-wide">
        {/* Recent Course */}
        <div className="card">
          <h3 className="card-title">Recent enrolled course</h3>

          <div className="course-card">
            <div className="course-icon">✏️</div>
            <div className="course-info">
              <p className="course-name">Customer Experience & Sales</p>
              <div className="progress-bar">
                <div className="progress-fill" />
              </div>
              <span className="progress-text">14/30 classes</span>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="card">
          <h3 className="card-title">Your Resources</h3>

          <ul className="resource-list">
            <li><span>📄 auto-layout.pdf</span><span className="resource-size">2.5 MB</span></li>
            <li><span>📄 onboarding.ppt</span><span className="resource-size">1.2 MB</span></li>
            <li><span>🖼️ basics_ui.png</span><span className="resource-size">1.8 MB</span></li>
          </ul>

          <button className="see-more">see more</button>
        </div>

        {/* Calendar */}
        <div className="card calendar-card">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev',
              center: 'title',
              right: 'next',
            }}
            height="auto"
            fixedWeekCount={false}
            showNonCurrentDates={false}
            events={[]}
          />
        </div>
      </div>


      {/* 2ND ROW */}
      <div className="dashboard-row">

        {/* Hours Spent */}
        <div className="card hours-card">
          <h3 className="card-title">Hours Spent</h3>

          <div className="hours-legend">
            <span><span className="dot study" /> Study</span>
            <span><span className="dot test" /> Online Test</span>
          </div>

          <div className="hours-chart-wrapper">
            {/* Y axis */}
            <div className="y-axis">
              <span>80 Hr</span>
              <span>60 Hr</span>
              <span>40 Hr</span>
              <span>20 Hr</span>
              <span>0 Hr</span>
            </div>
            {/* Chart */}
            <div className="hours-chart">
              {[
                { month: "Jan", study: 45, test: 30 },
                { month: "Feb", study: 20, test: 15 },
                { month: "Mar", study: 70, test: 25 },
                { month: "Apr", study: 38, test: 22 },
                { month: "May", study: 18, test: 10 },
              ].map((item, i) => (
                <div className="bar-group" key={i}>
                  <div
                    className="bar-stack"
                    data-tooltip={`🟧 ${item.study} Hr\n⬜ ${item.test} Hr`}
                  >
                    <div
                      className="bar study"
                      style={{ height: getHeight(item.study) }}
                    />
                    <div
                      className="bar test"
                      style={{ height: getHeight(item.test) }}
                    />
                  </div>

                  <span className="bar-label">{item.month}</span>
                </div>
              ))}

            </div>
          </div>
        </div>


        {/* Performance */}
        <div className="card performance-card">
          <h3 className="card-title">Performance</h3>

          <div className="performance-inner">
            <div className="performance-header">
              <div className="legend">
                <span className="legend-dot" />
                <span>Cognition AI’s Questions Performance</span>
              </div>

              <select className="dropdown">
                <option>Yearly</option>
                <option>Monthly</option>
                <option>Daily</option>
              </select>
            </div>

            <div className="gauge-wrapper">
              <svg width="200" height="120" viewBox="0 0 200 120">
                <path
                  d="M20 100 A80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="12"
                  strokeLinecap="round"
                />

                <path
                  d="M20 100 A80 80 0 0 1 140 40"
                  fill="none"
                  stroke="#ff5a1f"
                  strokeWidth="12"
                  strokeLinecap="round"
                />

                {[...Array(11)].map((_, i) => {
                  const angle = (-90 + i * 18) * (Math.PI / 180);
                  const x1 = 100 + Math.cos(angle) * 60;
                  const y1 = 100 + Math.sin(angle) * 60;
                  const x2 = 100 + Math.cos(angle) * 68;
                  const y2 = 100 + Math.sin(angle) * 68;
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                  );
                })}

                <line
                  x1="100"
                  y1="100"
                  x2="145"
                  y2="55"
                  stroke="#ff5a1f"
                  strokeWidth="3"
                />

                <circle cx="100" cy="100" r="6" fill="#ff5a1f" />
              </svg>
            </div>

            <div className="score">
              <p>Your Grade: <span>8.9/10</span></p>
              <a href="#">Click Here to See Detailed Feedback</a>
            </div>
          </div>
        </div>

        {/* To-Do List */}
        <div className="card todo-card">
          <h3 className="card-title">To-Do List</h3>

          <div className="todo-list">
            {todos.map(todo => (
              <div
                key={todo.id}
                className={`todo-item ${todo.completed ? "completed" : ""}`}
              >
                <div
                  className={`checkbox ${todo.completed ? "checked" : ""}`}
                  onClick={() => toggleTodo(todo.id)}
                >
                  {todo.completed && "✓"}
                </div>

                <div className="todo-text">
                  <p className="todo-title">{todo.title}</p>
                  <span className="todo-date">{todo.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>


      {/* 3RD ROW */}
      <div className="dashboard-row-modules">

        {/* Recent Enrolled Training Modules */}
        <div className="card modules-card">
          <div className="modules-header">
            <h3 className="card-title">Recent enrolled training modules</h3>
            <span className="view-all">All</span>
            <button className="search-btn">🔍︎</button>
          </div>

          <div className="module-item active">
            <div className="module-icon">✉</div>
            <div className="module-info">
              <p className="module-title">Workplace Policies</p>
              <div className="module-meta">
                <span>⏱ 5:30hrs</span>
                <span>📄 05 Lessons</span>
                <span>📝 Assignments</span>
              </div>
            </div>
          </div>

          <div className="module-item">
            <div className="module-icon">💬</div>
            <div className="module-info">
              <p className="module-title">Greeting & Engagement Techniques</p>
              <div className="module-meta">
                <span>⏱ 4:00hrs</span>
                <span>📄 03 Lessons</span>
                <span>📝 Assignments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Module */}
        <div className="card upcoming-card">
          <h3 className="card-title">Upcoming Module</h3>

          <div className="upcoming-item">
            <div className="upcoming-left">
              <span className="upcoming-icon">🎓</span>
              <div>
                <p className="upcoming-title">Inventory Awareness</p>
                <span className="upcoming-time">5:30pm</span>
              </div>
            </div>
            <button className="join-btn">Join</button>
          </div>

          <div className="upcoming-item">
            <div className="upcoming-left">
              <span className="upcoming-icon">📋</span>
              <div>
                <p className="upcoming-title">Stockroom Best Practices</p>
                <span className="upcoming-time">9:00pm</span>
              </div>
            </div>
            <button className="join-btn light">Join</button>
          </div>
        </div>

      </div>

    </>
  );
}
