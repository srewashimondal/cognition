import './FileItem.css';
import { useState, useEffect } from 'react';
import pdf_icon from '../../assets/icons/pdf-icon.svg';
import jpeg_icon from '../../assets/icons/jpeg-icon.svg';
import png_icon from '../../assets/icons/png-icon.svg';
import svg_icon from '../../assets/icons/svg-icon.svg';
import mp4_icon from '../../assets/icons/mp4-icon.svg';
import mov_icon from '../../assets/icons/mov-icon.svg';
import webm_icon from '../../assets/icons/webm-icon.svg';
import x_icon from '../../assets/icons/thin-orange-x.svg'
import hollow_star from '../../assets/icons/thin-orange-hollow-star.svg';
import filled_star from '../../assets/icons/thin-orange-filled-star.svg';

type FileItemProps = {
    file: File;
    removeable?: boolean;
    starrable?: boolean;
    onClick?: () => void;
    isUploading?: boolean;
}

export default function FileItem({ file, removeable, starrable, onClick, isUploading }: FileItemProps) {
    const [fill, setFill] = useState(0);
    const [val, setVal] = useState(0);
    const [starred, setStarred] = useState(false);
    
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
          {(file.type === "video/mp4") && <img src={mp4_icon} />} 
          {(file.type === "video/webm") && <img src={webm_icon} />} 
          {(file.type === "video/quicktime") && <img src={mov_icon} />} 
        </span>
  
        <div className={`file-info ${!isUploading ? "uploaded": ""}`}>
            <p className="file-name">{file.name}</p>

            {isUploading && <div className="progress-bar-hm">
                <div className="bar-wrapper">
                    <div
                        className="bar-fill"
                        style={{ width: `${fill}%` }}
                    />
                </div>
                {(val === 100) && <span className="progress-amt">{val}%</span>}
            </div>}
        </div>
        <span className="removeable-actions">
            {(removeable) && <span className="file-icon remove" onClick={onClick}>
                <img src={x_icon} />
            </span>}
            {(starrable) && <div className="star-swap" onClick={() => setStarred(!starred)}>
                <img className={`file-icon hollow ${starred ? "selected" : ""}`} src={hollow_star} />
                <img className={`file-icon filled ${starred ? "starred" : ""}`} src={filled_star} />
            </div>}
        </span>     
      </li>
    );
  }
  