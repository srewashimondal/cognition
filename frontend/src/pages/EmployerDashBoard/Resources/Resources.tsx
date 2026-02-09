import { useState, useRef, useEffect } from "react";
import "./Resources.css";
import white_plus from '../../../assets/icons/actions/white-plus-icon.svg';

type ResourceItem = {
  name: string;
  file: File | null;
};

type ResourceSection = {
  title: string;
  icon: string;
  tone: string;
  description: string;
  items: ResourceItem[];
};

const initialSections: ResourceSection[] = [
  {
    title: "Workplace Policies",
    icon: "🏢",
    tone: "policies",
    description: "Company-wide policies all employees must review",
    items: [
      {
        name: "Sexual Harassment Policy",
        file: null
      },
      {
        name: "Code of Conduct",
        file: null
      },
      {
        name: "Equal Opportunity Policy",
        file: null
      },
      {
        name: "Photo & Media Consent Waiver",
        file: null
      }
    ],
  },
  {
    title: "HR & Forms",
    icon: "🧾",
    tone: "hr",
    description: "Forms for requests, documentation, and approvals",
    items: [
      {
        name: "Request for Time Off",
        file: null
      },
      {
        name: "Doctor’s Excusal Form",
        file: null
      },
      {
        name: "Employee Information Update Form",
        file: null
      },
      {
        name: "Incident Report Form",
        file: null
      }
    ],
  },
  {
    title: "Training & Operations",
    icon: "🎓",
    tone: "training",
    description: "Guidelines to support daily retail operations",
    items: [
      {
        name: "Employee Handbook",
        file: null
      },
      {
        name: "Store Training Standards",
        file: null
      },
      {
        name: "Customer Service Guidelines",
        file: null
      },
      {
        name: "POS & Inventory Procedures",
        file: null
      }
    ],
  },
  {
    title: "Safety & Compliance",
    icon: "🛡️",
    tone: "safety",
    description: "Safety instructions and emergency information",
    items: [
      {
        name: "Workplace Safety Guidelines",
        file: null
      },
      {
        name: "Emergency Evacuation Plan",
        file: null
      },
      {
        name: "Health & Sanitation Protocols",
        file: null
      },
      {
        name: "Labor Law Notices",
        file: null
      }
    ],
  },
];

export default function Resources() {
  const [sections, setSections] = useState<ResourceSection[]>(initialSections);
  const [activeFile, setActiveFile] = useState<ResourceItem | null>(null);
  const fileInputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const handleFileUpload = (sectionIndex: number, file: File) => {
    setSections((prev) =>
      prev.map((section, idx) =>
        idx === sectionIndex
          ? {
              ...section,
              items: [...section.items, { name: file.name, file }],
            }
          : section
      )
    );
  };

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

      {/* Grid */}
      <div className="resources-grid">
        {sections.map((section, sectionIndex) => (
          <div key={section.title} className={`resource-card ${section.tone}`}>
            <div className="card-header">
              <h3>
                <span className={`section-icon ${section.tone}`}>
                  {section.icon}
                </span>
                {section.title}
              </h3>
              <p>{section.description}</p>

              <ul className="resource-list">
              {section.items.map((item, idx) => (
                <li key={idx} className="resource-item">
                  <span className="doc-icon">📄</span>
                  <span className="doc-name">{item.name}</span>
                  <button
                    className="view-btn-1"
                    onClick={() => setActiveFile(item)}
                  >
                    View
                  </button>
                </li>
                ))}
              </ul>

              {/* Add file */}
              <button
                className="add-file-btn"
                onClick={() => fileInputRefs.current[sectionIndex]?.click()}
              >
                <span>
                  <img src={white_plus} />
                </span>
                Add File
              </button>

              <input
                type="file"
                hidden
                ref={(el) => {
                  if (el) fileInputRefs.current[sectionIndex] = el;
                }}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(sectionIndex, e.target.files[0]);
                  }
                }}
              />
            </div>

          </div>
        ))}
      </div>

      {/* Modal */}
      {activeFile && (
        <div
          className="modal-overlay"
          onClick={() => setActiveFile(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{activeFile.name}</h3>
              <button
                className="close-btn"
                onClick={() => setActiveFile(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {activeFile.file?.type.includes("pdf") && (
                <iframe
                  src={URL.createObjectURL(activeFile.file)}
                  title="PDF Preview"
                />
              )}

              {activeFile.file?.type.startsWith("image/") && (
                <img
                  src={URL.createObjectURL(activeFile.file)}
                  alt="Preview"
                />
              )}

              {!activeFile.file?.type !== null &&
              !activeFile.file?.type.includes("pdf") &&
                !activeFile.file?.type.startsWith("image/") && (
                  <div className="file-fallback">
                    <p>Preview not available.</p>
                    {activeFile.file &&
                    <a
                      href={URL.createObjectURL(activeFile.file)}
                      download={activeFile.name}
                    >
                      Download File
                    </a>}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
