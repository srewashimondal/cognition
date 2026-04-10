import './JoinWorkspace.css';
import { useState, useEffect } from 'react';
import { db } from '../../../../firebase';
import { 
    doc, 
    getDoc, 
    updateDoc, 
    setDoc, 
    serverTimestamp, 
    addDoc,
    collection 
} from 'firebase/firestore';
import { generateJoinCode } from '../../../../utils/Utils';
import plusSquare from '../../../../assets/icons/orange-plus-square.svg';
import userJoin from '../../../../assets/icons/blue-user-join.svg';
import leftArrow from '../../../../assets/icons/orange-left-arrow.svg';
import key from '../../../../assets/icons/blue-key-icon.svg';

type JoinWorkspaceProps = {
    user: any;
    setWorkspaceRef: (val: any) => void;
    option: "create" | "join" | null;
    setOption: (val: "create" | "join" | null) => void;
    onNext: (val: boolean) => void;
}

export default function JoinWorkspace({ user, 
                                        setWorkspaceRef, 
                                        option, 
                                        setOption, 
                                        onNext }: JoinWorkspaceProps) {
    const [show, setShow] = useState(false);
    const [pendingCode, setPendingCode] = useState(false);
    const [code, setCode] = useState<string[]>(Array(6).fill(""));

    useEffect(() => {
        const timeout = setTimeout(() => {
          setShow(true);
        }, 50);
      
        return () => clearTimeout(timeout);
    }, []);

    const handleContinue = async () => {
        if (option === "create") {

            const workspaceRef = await addDoc(collection(db, "workspaces"), {
                createdAt: serverTimestamp()
            });

            const code = generateJoinCode();

            await setDoc(doc(db, "joinCodes", code), {
                workspaceRef: workspaceRef,
                createdAt: serverTimestamp()
            });

            await updateDoc(doc(db, "users", user.uid), {
                workspaceID: workspaceRef
            });

            setWorkspaceRef(workspaceRef);
            onNext(true);
            return; 
        } else if (option === "join") {
            setShow(false);
            setTimeout(() => {
                setPendingCode(true);
                setShow(true);
            }, 200);
        }
    }

    const handleJoin = async () => {
        /* Join logic */
        if (code.length < 6) {
            alert("Please enter all 6 digits of the code.");
        }

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

        setWorkspaceRef(workspaceRef);
        onNext(true);
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
            { pendingCode ?
                <>
                    <div className="jw-back">
                        <div className="back-icon" 
                        onClick={() => {
                            setShow(false);
                            setTimeout(() => {
                                setPendingCode(false);
                                setShow(true);
                            }, 200)
                        }}>
                            <img src={leftArrow} />
                        </div>
                    </div>
                    <div className="jw-header">
                        <div className="jw-icon blue big">
                            <img src={key} />
                        </div>
                        <h3>Enter your join code</h3>
                        <p>Your manager or admin should have sent you a 6-digit<br /> code to get started.</p>
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
                    >Continue</button>
                </>
                :<>
                    <div className="jw-header">
                        <h3>Welcome! Let's get you set up.</h3>
                        <p>Are you starting fresh or joining an existing team?</p>
                    </div>
                    <div className="jw-actions">
                        <button className={`jw-btn ${option === "create" ? "selected" : ""}`}
                            onClick={() => setOption("create")}
                        >   
                            <div className="jw-icon orange">
                                <img src={plusSquare} />
                            </div>
                            Create a Workspace
                            <p>I'm setting up this platform for my team.</p>
                        </button>
                        <button className={`jw-btn ${option === "join" ? "selected" : ""}`}
                            onClick={() => setOption("join")}
                        >   
                            <div className="jw-icon blue">
                                <img src={userJoin} />
                            </div>
                            Join a Workspace
                            <p>My team already uses this platform.</p>
                        </button>
                    </div>
                    <button
                        className="jw-continue"
                        onClick={handleContinue}
                    >Continue</button>
                </>}
        </div>
    );
}