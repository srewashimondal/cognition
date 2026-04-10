import './EmployeeOnboarding.css';
import { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { 
    doc, 
    getDoc, 
    updateDoc, 
    getDocs,
    serverTimestamp, 
    addDoc,
    collection,
    query,
    where
} from 'firebase/firestore';

type JoinWorkspaceProps = {
    user: any;
    setWorkspaceRef: (val: any) => void;
    onNext: (val: boolean) => void;
}

export default function JoinWorkspace({ user, setWorkspaceRef, onNext }: JoinWorkspaceProps) {
    const [show, setShow] = useState(false);
    const [code, setCode] = useState<string[]>(Array(6).fill(""));

    useEffect(() => {
        const timeout = setTimeout(() => {
          setShow(true);
        }, 50);
      
        return () => clearTimeout(timeout);
    }, []);

    const [joining, setJoining] = useState(false);
    const handleJoin = async () => {
        if (code.length < 6) {
            alert("Please enter all 6 digits of the code.");
        }

        try {
            setJoining(true);
            const enteredCode = code.join("").toUpperCase();
            const codeDoc = await getDoc(doc(db, "joinCodes", enteredCode));
            if (!codeDoc.exists()) {
                alert("Invalid code");
                return;
            }
            const workspaceRef = codeDoc.data().workspaceRef;

            await updateDoc(doc(db, "users", user.uid), {
                workspaceID: workspaceRef
            });

            const simulationModulesSnap = await getDocs(
                query(
                    collection(db, "simulationModules"),
                    where("workspaceRef", "==", workspaceRef),
                    where("deployed", "==", true)
                )
            );
            
            for (const simulationModuleDoc of simulationModulesSnap.docs) {
                const moduleRef = simulationModuleDoc.ref;
            
                const existing = await getDocs(
                    query(
                        collection(db, "simulationModuleAttempts"),
                        where("user", "==", doc(db, "users", user.uid)),
                        where("moduleInfo", "==", moduleRef)
                    )
                );
            
                if (!existing.empty) continue;
            
                await addDoc(collection(db, "simulationModuleAttempts"), {
                    user: doc(db, "users", user.uid),
                    workspaceRef,
                    moduleInfo: moduleRef,
                    status: "not begun",
                    percent: 0,
                    createdAt: serverTimestamp()
                });
            }

            const standardModulesSnap = await getDocs(
                query(
                    collection(db, "standardModules"),
                    where("workspaceRef", "==", workspaceRef),
                    where("deployed", "==", true)
                )
            );
            
            for (const standardModuleDoc of standardModulesSnap.docs) {
                const moduleRef = standardModuleDoc.ref;
            
                const existing = await getDocs(
                    query(
                        collection(db, "standardModuleAttempts"),
                        where("user", "==", doc(db, "users", user.uid)),
                        where("moduleInfo", "==", moduleRef)
                    )
                );
            
                if (!existing.empty) continue;
            
                await addDoc(collection(db, "standardModuleAttempts"), {
                    user: doc(db, "users", user.uid),
                    workspaceRef,
                    moduleInfo: moduleRef,
                    status: "not begun",
                    percent: 0,
                    createdAt: serverTimestamp()
                });
            }

            setWorkspaceRef(workspaceRef);
            onNext(true);
        } catch (err) {
            console.error(err);
        } finally {
            setJoining(false);
        }
    }

    const handleChange = (value: string, index: number) => {
        if (!/^[0-9a-zA-Z]?$/.test(value)) return;
      
        const newCode = [...code];
        newCode[index] = value.toUpperCase();
        setCode(newCode);
      
        if (value && index < 5) {
            document.getElementById(`code-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            document.getElementById(`code-${index - 1}`)?.focus();
        }
    };

    return (
        <div className={`ob-modal jw ${show ? "show" : ""}`}>
            <div className="jw-header">
                        <div className="jw-icon orange big">
                            👋
                        </div>
                        <h3>Welcome Aboard</h3>
                        <p>Your team is waiting for you. Enter the 6-digit code your <br /> manager shared to join your workspace.</p>
                    </div>
                    <div className="jw-code-container">
                        {code.map((digit, i) => (
                            <input
                            key={i}
                            id={`code-${i}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(e.target.value, i)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            className="code-box"
                            />
                        ))}
                    </div>
                    <button
                        className="jw-continue"
                        onClick={handleJoin}
                        disabled={joining}
                    >
                    {joining && <div className="spinner" />}
                    {joining? 
                    "Joining Workspace"
                    : "Continue"}
                    
                    </button>
        </div>
    );
}