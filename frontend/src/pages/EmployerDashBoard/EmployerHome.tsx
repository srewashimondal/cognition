import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';


export default function EmployerHome() {
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
        <div className="card">
          <h3 className="card-title">Hours Spent</h3>
        </div>

        {/* Performance */}
        <div className="card">
          <h3 className="card-title">Performance</h3>
        </div>

        {/* To-Do List */}
        <div className="card">
          <h3 className="card-title">To-Do List</h3>
        </div>
      </div>
    </>
  );
}
