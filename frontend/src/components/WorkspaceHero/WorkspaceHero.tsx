import './WorkspaceHero.css';
import type { WorkspaceType } from '../../types/User/WorkspaceType';
// import beautyBanner from '../../assets/illustrations/banners/beauty-banner.jpeg';
// import pharmacyBanner from '../../assets/illustrations/banners/pharmacy-banner.jpeg';
import { useState, useEffect } from 'react';
import store_icon from '../../assets/icons/white-store-icon.svg';
import location_icon from '../../assets/icons/white-location-icon.svg';
import share_icon from '../../assets/icons/white-share-icon.svg';
import { Tooltip } from "@radix-ui/themes";

type WorkspaceHero = {
    role: "employer" | "employee";
    workspace: WorkspaceType;
    onClick?: () => void;
};

export default function WorkspaceHero({ role, workspace, onClick }: WorkspaceHero) {
    return (
        <div className="workspace-hero">
            {/*<img className="workspace-banner" src={beautyBanner} alt="Workspace banner" />*/}
            <div className={`workspace-banner ${role}`} />
            { (role === "employer") &&
                <Tooltip content="Share Workspace">
                    <div className="share-icon" onClick={onClick}>
                        <img src={share_icon} />
                    </div>
                </Tooltip>}
            <div className="workspace-hero-content">
                <img className="workspace-avatar" src={workspace.icon} alt={`${workspace.name} icon`} />
                <div className="workspace-meta-wrapper">
                    <h1 className="workspace-title no-bottom">{workspace.name}</h1>
                    <div className="workspace-meta">
                        <div className="workspace-meta-item">
                            <img src={store_icon} /> {workspace.store?.storeName}
                        </div>
                        <span>·</span>
                        <div className="workspace-meta-item">
                            {workspace.store?.category}
                        </div>
                        <span>·</span>
                        <div className="workspace-meta-item">
                            <img src={location_icon} /> {workspace.store?.storeFormat}
                        </div>
                        <span>·</span>
                        <div className="workspace-meta-item">
                            7 courses
                        </div>
                        <span>·</span>
                        <div className="workspace-meta-item">
                            247 total learners
                        </div>
                    </div>
                    {/*<div className="workspace-meta">
                        <div className="workspace-meta-item">
                            7 courses
                        </div>
                        <span>·</span>
                        <div className="workspace-meta-item">
                            247 total learners
                        </div>
                    </div>*/}
                </div>
            </div>
        </div>
    );
}