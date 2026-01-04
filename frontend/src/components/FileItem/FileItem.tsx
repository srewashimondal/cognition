import './FileItem.css';
import { useState, useEffect } from 'react';
import pdf_icon from '../../assets/icons/pdf-icon.svg';
import jpeg_icon from '../../assets/icons/jpeg-icon.svg';
import png_icon from '../../assets/icons/png-icon.svg';
import svg_icon from '../../assets/icons/svg-icon.svg';

export default function FileItem({ file }: { file: File }) {
    const [fill, setFill] = useState(0);
    const [val, setVal] = useState(0);
  
    useEffect(() => {
        setFill(0);
        const t = setTimeout(() => {setFill(100);}, 10);
        return () => clearTimeout(t);
    }, [file]);

    useEffect(() => {
        const t = setTimeout(() => setVal(100), 810);
        return () => clearTimeout(t);
      }, []);
  
    return (
      <li className="file-item">
        <span className="file-icon">
          {(file.type === "application/pdf") && <img src={pdf_icon} />} 
          {(file.type === "image/jpeg") && <img src={jpeg_icon} />} 
          {(file.type === "image/png") && <img src={png_icon} />} 
          {(file.type === "image/svg+xml") && <img src={svg_icon} />} 
        </span>
  
        <div className="file-info">
            <p className="file-name">{file.name}</p>

            <div className="progress-bar">
                <div className="bar-wrapper">
                    <div
                        className="bar-fill"
                        style={{ width: `${fill}%` }}
                    />
                </div>
                {(val === 100) && <span className="progress-amt">{val}%</span>}
            </div>
        </div>
      </li>
    );
  }
  