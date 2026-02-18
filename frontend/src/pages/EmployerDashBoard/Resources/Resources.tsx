import { useState, useEffect } from "react";
import "./Resources.css";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db, storage } from "../../../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import type { WorkspaceType } from "../../../types/User/WorkspaceType";
import UploadDropzone from "../../../components/UploadDropzone/UploadDropzone";
import white_plus from '../../../assets/icons/actions/white-plus-icon.svg';
import note_icon from '../../../assets/icons/orange-note-icon.svg';


export type ResourceItem = {
  title: string;
  section: string;
  filePath: string;
};

export type ResourceSection = {
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
    items: [/*
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
        file: null*
      }*/
    ],
  },
  {
    title: "HR & Forms",
    icon: "🧾",
    tone: "hr",
    description: "Forms for requests, documentation, and approvals",
    items: [/*
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
    */],
  },
  {
    title: "Training & Operations",
    icon: "🎓",
    tone: "training",
    description: "Guidelines to support daily retail operations",
    items: [/*
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
    */],
  },
  {
    title: "Safety & Compliance",
    icon: "🛡️",
    tone: "safety",
    description: "Safety instructions and emergency information",
    items: [/*
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
    */],
  },
  {
    title: "Maps",
    icon: "🗺️",
    tone: "training",
    description: "Maps of the store",
    items: [],
  },
];

export default function Resources({ workspace }: { workspace: WorkspaceType }) {
  const [sections, setSections] = useState<ResourceSection[]>(initialSections);
  const [activeFile, setActiveFile] = useState<ResourceItem | null>(null);
  const [activeFileUrl, setActiveFileUrl] = useState<string | null>(null);
  const [openUploadModal, setOpenUploadModal] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

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

  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadSectionIndex, setUploadSectionIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const handleUploadToFirebase = async () => {
    if (uploadFiles.length === 0 || !uploadTitle.trim() || uploadSectionIndex === null || !workspace?.id) return;
  
    try {
      setIsUploading(true);
      const file = uploadFiles[0]; 
      const storagePath = `trainingDocuments/${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
  
      await addDoc(
        collection(db, "workspaces", workspace.id, "resources"),
        {
          title: uploadTitle.trim(),
          filePath: storagePath,
          section: sections[uploadSectionIndex].title,
        }
      );
  
      setSections(prev =>
        prev.map((section, idx) =>
          idx === uploadSectionIndex
            ? {
                ...section,
                items: [
                  ...section.items,
                  {
                    title: uploadTitle.trim(),
                    filePath: storagePath,
                    section: section.title
                  }
                ]
              }
            : section
        )
      );
  
      setUploadFiles([]);
      setUploadTitle("");
      setUploadSectionIndex(null);
      setOpenUploadModal(false);
      setIsUploading(false);
  
    } catch (err) {
      console.error("Upload failed:", err);
    }
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
                  <span className="doc-icon">
                    <img src={note_icon} />
                  </span>
                  <span className="doc-name">{item.title}</span>
                  <button
                    className="view-btn-1"
                    onClick={() => handleView(item)}
                  >
                    View
                  </button>
                </li>
                ))}
              </ul>

              {/* Add file */}
              <button
                className="add-file-btn"
                /*onClick={() => fileInputRefs.current[sectionIndex]?.click()}*/
                onClick={() => {setUploadSectionIndex(sectionIndex); setOpenUploadModal(true);}}
              >
                <span>
                  <img src={white_plus} />
                </span>
                Add File
              </button>

              {/*<input
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
              />*/}
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
      { openUploadModal &&
          <div className="modal-overlay" onClick={() => setOpenUploadModal(false)}>
            <div className="modal-content upload" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Upload File</h3>
                <button
                  className="close-btn"
                  onClick={() => setOpenUploadModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body upload">
                <div>
                  <label>Title</label>
                  <div className="input-wrapper type-text">
                    <input type="text" required placeholder="Enter a title for this file" 
                    value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)}/>
                  </div>
                </div>
                <div>
                  <label>Upload File</label>
                  <UploadDropzone amount="single" stretch={true}
                  files={uploadFiles} setFiles={setUploadFiles} 
                  allowedTypes={["application/pdf", "image/png", "image/jpeg", "image/webp"]}/>
                </div>
                <button type="button" className="OK-button" onClick={handleUploadToFirebase} disabled={!uploadFiles.length || !uploadTitle.trim()}>
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
      }
    </div>
  );
}
