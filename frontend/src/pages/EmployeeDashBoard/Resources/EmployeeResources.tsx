import "./EmployeeResources.css";
import { useEffect } from "react";
import note_icon from '../../../assets/icons/orange-note-icon.svg';

const resourceSections = [
  {
    title: "Workplace Policies",
    icon: "🏢",
    tone: "policies",
    description: "Company-wide policies all employees must review",
    items: [
      "Sexual Harassment Policy",
      "Code of Conduct",
      "Equal Opportunity Policy",
      "Photo & Media Consent Waiver",
    ],
  },
  {
    title: "HR & Forms",
    icon: "🧾",
    tone: "hr",
    description: "Forms for requests, documentation, and approvals",
    items: [
      "Request for Time Off",
      "Doctor’s Excusal Form",
      "Employee Information Update Form",
      "Incident Report Form",
    ],
  },
  {
    title: "Training & Operations",
    icon: "🎓",
    tone: "training",
    description: "Guidelines to support daily retail operations",
    items: [
      "Employee Handbook",
      "Store Training Standards",
      "Customer Service Guidelines",
      "POS & Inventory Procedures",
    ],
  },
  {
    title: "Safety & Compliance",
    icon: "🛡️",
    tone: "safety",
    description: "Safety instructions and emergency information",
    items: [
      "Workplace Safety Guidelines",
      "Emergency Evacuation Plan",
      "Health & Sanitation Protocols",
      "Labor Law Notices",
    ],
  },
];

export default function EmployeeResources() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
  
  return (
    <div className="resources-page">
      {/* Header */}
      <div className="resources-header">
        <h2>Resources</h2>
        <p>
          Access important documents, policies, and forms to support your work
          and training.
        </p>
      </div>

      {/* Resource Sections */}
      <div className="resources-grid">
        {resourceSections.map((section) => (
          <div
            key={section.title}
            className={`resource-card ${section.tone}`}
          >
            <div className="card-header">
              <h3>
                <span className={`section-icon ${section.tone}`}>
                  {section.icon}
                </span>
                {section.title}
              </h3>
              <p>{section.description}</p>
            </div>

            <ul className="resource-list">
              {section.items.map((item) => (
                <li key={item} className="resource-item">
                  <span className="doc-icon">
                    <img src={note_icon}/>
                  </span>
                  <span className="doc-name">{item}</span>
                  <button className="view-btn-1">View</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}