import { useState, useEffect } from 'react';
import Question from '../../Question/Question.tsx';

export default function WorkspaceInfo() {
    const [workspaceName, setWorkspaceName] = useState("");
    const [workspaceIcon, setWorkspaceIcon] = useState<File | null>(null);
    const [accessibilityPref, setAccessibilityPref] = useState<string[]>([]); 

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    useEffect(() => {
        if (!workspaceIcon) {
            setImagePreview(null);
            return;
        }
        const url = URL.createObjectURL(workspaceIcon);
        setImagePreview(url);

        return () => URL.revokeObjectURL(url);
    }, [workspaceIcon]);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        {/* put in backend logic later */}
    }

    return (
        <div className="wi-div">
            <form onSubmit={handleSubmit}>

            <Question question={"Workspace Name"} input_type={"text"} 
            value={workspaceName} onChange={setWorkspaceName} 
            direction={"This will be the name of your Workspace."}/>

            <Question question={"Workspace Icon"} input_type={"file"} 
            value={imagePreview} onChange={setWorkspaceIcon} 
            direction={"You may change the icon of your workspace now if you wish."}
            meta={"pfp"}/>

            <Question question={"Accessibility Preferences"} input_type={"checkbox"} 
            value={accessibilityPref} onChange={setAccessibilityPref} 
            options={["ADHD Focus"]} />

            </form>
        </div>
    );
}