import { useEffect } from 'react';
import rocket_icon from '../../../../../assets/icons/rocket-icon.svg';


export default function LaunchWorkspace({ option, registerFormId, setComplete }: { option: "create" | "join" | null, registerFormId: (id: string) => void, setComplete: () => void }) {
    const formId = "launch-workspace";

    useEffect(() => {
        registerFormId(formId);
        return () => registerFormId(""); 
    }, []);

    function handleLaunch (e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        setComplete();
    }

    return (
        <div className="lw-div">
            <img src={rocket_icon}/>
            <h3>
                { option === "create" ?
                "Your Workspace is Almost Done!" 
                : "You are almost there!"
                }
            </h3>
            <p>
                { option === "create" ?
                "Whenever you are ready, you can launch your workspace and get started with Cognition."
                : "Whenever you are ready, you can get started with Cognition."
                }
            </p>
            <button className="jw-continue" type="button" onClick={handleLaunch}>{option === "create" ? "Launch Workspace" : "Open Dashboard"}</button>
        </div>
    );
}