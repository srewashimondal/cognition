import './UploadDropzone.css';
import { useState, useRef } from 'react';
import FileItem from '../FileItem/FileItem.tsx';
import upload_icon from '../../assets/icons/file-upload-icon.svg';
import movie_icon from '../../assets/icons/movie-icon.svg';

type UploadDropzoneProps = {
    amount: "single" | "multiple";
    video?: boolean;
    files?: File[];
    setFiles?: React.Dispatch<React.SetStateAction<File[]>>;
    allowedTypes?: string[];
    onDelete?: (file: File) => void;
    handleChange?: () => void;
    stretch?: boolean;
}

export default function UploadDropzone({ amount, video, files, setFiles, allowedTypes, onDelete, handleChange, stretch }: UploadDropzoneProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [dragging, setDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const addFiles = (newFiles: File[]) => {
        setIsUploading(true);
        setTimeout(() => {
            setFiles?.(prev => [...prev, ...newFiles]);
            setIsUploading(false);
            handleChange?.();
        }, 2000);
    };

    switch (amount) {
        case "multiple":
            return (
                <div className={`upload-container ${amount} ${stretch ? "stretch" : ""}`}>
                    <div className={`upload-div comp ${(dragging) ? "dragging" : ""}`} onClick={() => fileInputRef.current?.click()}
                                      onDragOver={(e) => {e.preventDefault(); setDragging(true);}} 
                                      onDragLeave={() => setDragging(false)}
                                      onDrop={(e) => {e.preventDefault(); setDragging(false);
                                        const newFiles = Array.from(e.dataTransfer.files).filter(
                                            (file) => file.type ==="application/pdf"
                                        )
                                        addFiles(newFiles);
                                      }} >

                        <div className="dropzone comp">
                            <input ref={fileInputRef} type="file" accept="application/pdf"
                            multiple hidden onChange={(e) => addFiles(Array.from(e.target.files ?? []))} /> 
                            <img src={upload_icon}/>
                            <div className="dropzone-manual">
                                <p>
                                    <strong>Drag and drop files</strong>
                                </p>
                                <span>OR</span>
                                <button type="button" 
                                onClick={(e) => {e.stopPropagation(); fileInputRef.current?.click(); }}>Browse Files</button>
                            </div>
                        </div>
                    </div>
                    <div className="uploaded-content-div comp">
                            {Array.isArray(files) && (
                                <ul className="file-list">
                                    {files.map((file: File) => (
                                        <FileItem key={file.name} file={file} removeable={true} starrable={true} onClick={() => onDelete?.(file)}
                                        isUploading={isUploading} />
                                    ))}
                                </ul>
                            )}
                    </div>
                </div>
            );
            case "single":
                return (
                    <div className={`upload-container ${amount} ${stretch ? "stretch" : ""}`}>
                        <div
                            className={`upload-div comp ${dragging ? "dragging" : ""}`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragging(true);
                            }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragging(false);
            
                                const droppedFiles = Array.from(e.dataTransfer.files).filter(
                                    (file) => allowedTypes?.includes(file.type)
                                );
            
                                if (droppedFiles[0]) {
                                    setFiles?.([droppedFiles[0]]);
                                }
                            }}
                        >
            
                            <div className="dropzone comp">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    hidden
                                    accept={allowedTypes?.join(",")}
                                    onChange={(e) => {
                                        const selectedFiles = Array.from(e.target.files || []).filter(
                                            (file) => allowedTypes?.includes(file.type)
                                        );
            
                                        if (selectedFiles[0]) {
                                            setFiles?.([selectedFiles[0]]);
                                        }
                                    }}
                                />
            
                                <img src={video? movie_icon : upload_icon} />
                                <div className="dropzone-manual">
                                    <p>
                                        <strong>Drag and drop a file</strong>
                                    </p>
                                    <span>OR</span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fileInputRef.current?.click();
                                        }}
                                    >
                                        Browse Files
                                    </button>
                                </div>
                        </div>
                </div>
                <div className="uploaded-content-div">
                    {files?.[0] && (
                        <ul className="file-list">
                            <FileItem key={files[0].name} file={files[0]} removeable={true} onClick={() => onDelete?.(files[0])}/>
                        </ul>
                    )}
                </div>
            </div>
        );
            
    }
}