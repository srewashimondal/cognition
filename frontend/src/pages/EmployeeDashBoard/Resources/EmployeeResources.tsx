import "./EmployeeResources.css";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, storage } from "../../../firebase";
import { getDownloadURL, ref } from "firebase/storage";
import type { WorkspaceType } from "../../../types/User/WorkspaceType";
import type { ResourceItem, ResourceSection } from "../../EmployerDashBoard/Resources/Resources";
import note_icon from '../../../assets/icons/orange-note-icon.svg';

const resourceSections = [
  {
    title: "Workplace Policies",
    icon: "🏢",
    tone: "policies",
    description: "Company-wide policies all employees must review",
    items: [],
  },
  {
    title: "HR & Forms",
    icon: "🧾",
    tone: "hr",
    description: "Forms for requests, documentation, and approvals",
    items: [],
  },
  {
    title: "Training & Operations",
    icon: "🎓",
    tone: "training",
    description: "Guidelines to support daily retail operations",
    items: [],
  },
  {
    title: "Safety & Compliance",
    icon: "🛡️",
    tone: "safety",
    description: "Safety instructions and emergency information",
    items: [],
  },
  {
    title: "Maps",
    icon: "🛡️",
    tone: "training",
    description: "Maps of the store",
    items: [],
  },
];

export default function EmployeeResources({ workspace }:{ workspace: WorkspaceType }) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const [activeFile, setActiveFile] = useState<ResourceItem | null>(null);
  const [activeFileUrl, setActiveFileUrl] = useState<string | null>(null);
  const [sections, setSections] = useState<ResourceSection[]>(resourceSections);


  useEffect(() => {
    const fetchResources = async () => {
      if (!workspace?.id) return;
  
      try {
        const resourcesRef = collection(
          db,
          "workspaces",
          workspace.id,
          "resources"
        );
  
        const snapshot = await getDocs(resourcesRef);
  
        const fetchedResources: ResourceItem[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            filePath: data.filePath, 
            section: data.section,
          };
        });

        setSections(prevSections =>
          prevSections.map(section => ({
            ...section,
            items: fetchedResources.filter(
              r => r.section === section.title
            )
          }))
        );
  
      } catch (err) {
        console.error("Error fetching resources:", err);
      }
    };
  
    fetchResources();
  }, [workspace]);
  
  const handleView = async (item: ResourceItem) => {
    const fileRef = ref(storage, item.filePath);
    const url = await getDownloadURL(fileRef);
  
    setActiveFile(item);
    setActiveFileUrl(url);
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

      {/* Resource Sections */}
      <div className="resources-grid">
        {sections.map((section) => (
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
                <li key={item.title} className="resource-item">
                  <span className="doc-icon">
                    <img src={note_icon}/>
                  </span>
                  <span className="doc-name">{item.title}</span>
                  <button className="view-btn-1" onClick={() => handleView(item)}>View</button>
                </li>
              ))}
            </ul>
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
              <h3>{activeFile.title}</h3>
              <button
                className="close-btn"
                onClick={() => setActiveFile(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {activeFileUrl?.includes(".pdf") && (
                <iframe
                  src={activeFileUrl}
                  title="PDF Preview"
                />
              )}

              {activeFileUrl &&
                  (activeFileUrl.includes(".png") ||
                  activeFileUrl.includes(".jpg") ||
                  activeFileUrl.includes(".jpeg") ||
                  activeFileUrl.includes(".webp")) && (
                  <img
                    src={activeFileUrl}
                    alt="Preview"
                  />
                )}

              {activeFileUrl &&
              !activeFile?.title.toLowerCase().endsWith(".pdf") &&
              !activeFile?.title.toLowerCase().match(/\.(png|jpg|jpeg|webp)$/) && (
                  <div className="file-fallback">
                    {/*<p>Preview not available.</p>*/}
                    <a
                      href={activeFileUrl}
                      download={activeFile.title}
                    >
                      Download File
                    </a>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}