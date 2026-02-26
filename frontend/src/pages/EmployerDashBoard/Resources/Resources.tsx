import { useState, useEffect } from "react";
import "./Resources.css";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db, storage } from "../../../firebase";
import { getDownloadURL, ref, uploadBytes, deleteObject } from "firebase/storage";
import type { WorkspaceType } from "../../../types/User/WorkspaceType";
import UploadDropzone from "../../../components/UploadDropzone/UploadDropzone";
import white_plus from '../../../assets/icons/actions/white-plus-icon.svg';
import note_icon from '../../../assets/icons/orange-note-icon.svg';


export type ResourceItem = {
  id: string;
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
    description: "Maps of the store (only IMAGE files allowed)",
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

  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadSectionIndex, setUploadSectionIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const handleUploadToFirebase = async () => {
    console.log("Function called");
    if (uploadFiles.length === 0 || !uploadTitle.trim() || uploadSectionIndex === null || !workspace?.id) return;
    console.log("Function called and returned");
    try {
      let structuredSummaryString: string = "";
      const file = uploadFiles[0]; 

      const isMapSection = sections[uploadSectionIndex].title === "Maps";
      
      setIsGeneratingSummary(true);
      const formData = new FormData();
      formData.append("file", file);

      const endpoint = isMapSection ? "http://127.0.0.1:8000/ai/analyze-map" : "http://127.0.0.1:8000/ai/summarize-document";

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to process file");
      }

      const summaryData = await res.json();
      structuredSummaryString = JSON.stringify(summaryData);

      setIsUploading(true);
      const storagePath = `trainingDocuments/${workspace.id}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
  
      const docRef = await addDoc(
        collection(db, "workspaces", workspace.id, "resources"),
        {
          title: uploadTitle.trim(),
          filePath: storagePath,
          section: sections[uploadSectionIndex].title,
          summary: structuredSummaryString ,
          type: isMapSection ? "map" : "document"
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
                    id: docRef.id,
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
  
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
      setIsGeneratingSummary(false);
    }
  };
  
  const handleDeleteFile = async () => {
    if (!activeFile || !workspace?.id) return;
  
    try {
      await deleteDoc(
        doc(db, "workspaces", workspace.id, "resources", activeFile.id)
      );
  
      const fileRef = ref(storage, activeFile.filePath);
      await deleteObject(fileRef);
  
      setSections(prev =>
        prev.map(section => ({
          ...section,
          items: section.items.filter(item => item.id !== activeFile.id)
        }))
      );
  
      setActiveFile(null);
      setActiveFileUrl(null);
  
    } catch (err) {
      console.error("Error deleting file:", err);
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
              
              <div className="modal-actions">
                <button
                  className="delete-btn"
                  onClick={handleDeleteFile}
                >
                  Delete File
                </button>

                <button
                  className="close-btn"
                  onClick={() => setActiveFile(null)}
                >
                  ✕
                </button>
              </div>
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
                  allowedTypes={
                    uploadSectionIndex !== null &&
                    sections[uploadSectionIndex].title === "Maps"
                      ? ["image/png", "image/jpeg", "image/webp"]
                      : ["application/pdf"]
                  }/>
                </div>
                <button type="button" className="OK-button" onClick={handleUploadToFirebase} disabled={!uploadFiles.length || !uploadTitle.trim() || uploadSectionIndex === null || !workspace?.id || isUploading || isGeneratingSummary }>
                  {isGeneratingSummary ?
                    "Analyzing document..."
                    : isUploading 
                      ? "Uploading..."
                      : "Upload" }
                </button>
              </div>
            </div>
          </div>
      }
    </div>
  );
}
