import '../InviteLaunch.css';
import { useEffect } from 'react';
import orange_link_icon from '../../../../../assets/icons/orange-link-icon.svg';
import white_link_icon from '../../../../../assets/icons/white-link-icon.svg';
import orange_download_icon from '../../../../../assets/icons/orange-download-icon.svg';
import white_download_icon from '../../../../../assets/icons/white-download-icon.svg';
import temp_qrcode from '../../../../../assets/illustrations/temp_qr_code.png';

export default function InviteTeam({ registerFormId, onNext }: {registerFormId?: (id: string) => void, onNext?: () => void;}) {
    const formId = "invite-team-form";

    useEffect(() => {
        registerFormId?.(formId);
        return () => registerFormId?.(""); 
    }, []);


    function handleGenLink (e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        /* Backend Logic Later */
    }

    function handleDownload (e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        /* Backend Logic Later */
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        onNext?.();
        {/* put in backend logic later */}
    }
    
    return(
        <div className="it-div">
            <h3 className="question-text">Invite Your Teammates to your Workspace.</h3>
            <form id={formId} onSubmit={handleSubmit}>
                <div className="iv-wrapper">
                    <div className="link-wrapper">
                        <button type="button" className="gen-link-btn" onClick={handleGenLink}>
                            <div className="link-swap">
                                <img className="link-icon default" src={orange_link_icon}/>
                                <img className="link-icon hover" src={white_link_icon}/>
                            </div>
                            <span>Generate a Shareable Link</span>
                        </button>
                    </div>
                    {/*<div className="a-divider"></div>*/}
                    <div className="qr-code-share">
                        <div className="download-btn-wrapper">
                            <button type="button" className="download-btn" onClick={handleDownload}>
                                <div className="download-swap">
                                    <img className="download-icon default" src={orange_download_icon}/>
                                    <img className="download-icon hover" src={white_download_icon}/>
                                </div>
                                <span>Download QR Code</span>
                            </button>
                        </div>
                        <div className="img-wrapper">
                            <img src={temp_qrcode}/>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}