import WorkspaceInfo from "./Subsections/WorkspaceInfo";
import StoreInfo from "./Subsections/StoreInfo";
import TeamDetails from "./Subsections/TeamDetails";

type CreateWorkspaceProps = {
    substep: number;
}

export default function CreateWorkspace({ substep }: CreateWorkspaceProps) {
    return (
        <div className="cw-div">
            {(substep === 0) && <WorkspaceInfo />}
            {(substep === 1) && <StoreInfo />}
            {(substep === 2) && <TeamDetails />}
        </div>
    );
}