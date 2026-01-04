import InviteTeam from "./Subsections/InviteTeam";
import LaunchWorkspace from "./Subsections/LaunchWorkspace";

type InviteLaunchProps = {
    substep: number;
}

export default function InviteLaunch({ substep }: InviteLaunchProps) {
    return (
        <div className="il-div">
            {(substep === 0) && <InviteTeam />}
            {(substep === 1) && <LaunchWorkspace />}
        </div>
    );
}