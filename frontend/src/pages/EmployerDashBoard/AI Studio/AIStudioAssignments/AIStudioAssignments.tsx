import "./AIStudioAssignments.css";

type Assignment = {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  status: "Done" | "Progress" | "Pending";
  action: string;
};

const assignments: Assignment[] = [
  {
    id: 1,
    title: "Conducting User Research",
    course: "User Research and Personas",
    dueDate: "July 1, 2024",
    status: "Done",
    action: "Submitted",
  },
  {
    id: 2,
    title: "Competitive Analysis Report",
    course: "Competitive Analysis",
    dueDate: "July 25, 2024",
    status: "Progress",
    action: "Upload",
  },
  {
    id: 3,
    title: "Creating Wireframes",
    course: "Wireframing and Prototyping",
    dueDate: "August 1, 2024",
    status: "Progress",
    action: "Upload",
  },
  {
    id: 4,
    title: "Usability Testing and Feedback",
    course: "Usability Testing",
    dueDate: "August 22, 2024",
    status: "Pending",
    action: "Upload",
  },
  {
    id: 5,
    title: "Developing Visual Designs",
    course: "Visual Design and Branding",
    dueDate: "August 29, 2024",
    status: "Pending",
    action: "Upload",
  },
  {
    id: 6,
    title: "Creating a Design System",
    course: "Design Systems",
    dueDate: "September 5, 2024",
    status: "Pending",
    action: "Upload",
  },
];

export default function AIStudioAssignments() {
  return (
    <div className="assignments-page">
      {/* Header */}
      <div className="assignments-header">
        <div>
          <h2>Assignments</h2>
          <p>View and manage your course assignments</p>
        </div>

        <div className="assignments-filter">
          🔍 <span>Filter by</span> <b>dates</b> | <b>Status</b>
        </div>
      </div>

      {/* Table */}
      <div className="assignments-table">
        <div className="table-header">
          <span>Assignment Title</span>
          <span>Course/lessons</span>
          <span>Due Date</span>
          <span>Status</span>
          <span>Submit</span>
        </div>

        {assignments.map((a) => (
          <div key={a.id} className="table-row">
            <span className="title">{a.title}</span>
            <span className="course">{a.course}</span>
            <span>{a.dueDate}</span>
            <span>
              <StatusBadge status={a.status} />
            </span>
            <span className="action">{a.action}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="assignments-footer">
        <div>
          Show
          <select>
            <option>10</option>
            <option>20</option>
          </select>
          Row
        </div>

        <div className="pagination">
          ‹ <span className="active">1</span> 2 3 4 … 10 ›
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Assignment["status"] }) {
  return <span className={`status ${status.toLowerCase()}`}>{status}</span>;
}
