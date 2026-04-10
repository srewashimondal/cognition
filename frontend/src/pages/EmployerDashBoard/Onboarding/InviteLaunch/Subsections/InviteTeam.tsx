import '../InviteLaunch.css';
import { useState, useEffect } from 'react';
import { db } from '../../../../../firebase';
import { getDoc, 
        doc,
        collection,
        query,
        where,
        getDocs
     } from 'firebase/firestore';
import copyIcon from '../../../../../assets/icons/black-copy-icon.svg';

export default function InviteTeam({ user, registerFormId, onNext }: { user: any, registerFormId?: (id: string) => void, onNext?: () => void;}) {
    const formId = "invite-team-form";

    useEffect(() => {
        registerFormId?.(formId);
        return () => registerFormId?.(""); 
    }, []);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        onNext?.();
        {/* put in backend logic later */}
    }

    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        if (!joinCode) return;

        try {
            await navigator.clipboard.writeText(joinCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    }

    const [joinCode, setJoinCode] = useState<string | null>(null);
    useEffect(() => {
        const fetchJoinCode = async () => {
            if (!user?.uid) return;

            const userSnap = await getDoc(doc(db, "users", user.uid));
            if (!userSnap.exists()) return;

            const workspaceRef = userSnap.data().workspaceID;
            if (!workspaceRef) return;

            const q = query(
                collection(db, "joinCodes"),
                where("workspaceRef", "==", workspaceRef)
            );

            const snap = await getDocs(q);

            if (!snap.empty) {
                setJoinCode(snap.docs[0].id);
            }
        };

        fetchJoinCode();
    }, [user]);
        
    return(
        <div className="it-div">
            <h3 className="question-text">Invite Your Teammates to your Workspace.</h3>
            <p>Share this code with your team so they can also join this workspace.</p>
            <form id={formId} onSubmit={handleSubmit}>
                <div className="jw-code-container">
                    {joinCode?.split("")
                    .map((digit, i) => (
                        <div
                        key={i}
                        id={`code-${i}`}
                        className="code-box"
                        >
                            {digit}
                        </div>
                    ))}
                </div>
                <button 
                    className="jw-continue" 
                    type="button"
                    onClick={handleCopy}
                >
                    <img src={copyIcon} />
                    {copied ? "Invite code copied!" : "Copy invite code"}
                </button>
                
            </form>
        </div>
    );
}