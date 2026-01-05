import { useEffect } from 'react';
import rocket_icon from '../../../../../assets/icons/rocket-icon.svg';


export default function LaunchWorkspace({ registerFormId }: { registerFormId: (id: string) => void }) {
    const formId = "launch-workspace";

    useEffect(() => {
        registerFormId(formId);
        return () => registerFormId(""); 
    }, []);

    function handleLaunch (e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        /* Backend Logic Later */
    }

    return (
        <div className="lw-div">
            <img src={rocket_icon}/>
            <h3>Your Workspace is Almost Done!</h3>
            <p>Whenever you are ready, you can launch your workspace to activate Cognition AI training.</p>
            <button type="button" onClick={handleLaunch}>Launch Workspace</button>
        </div>
    );
}