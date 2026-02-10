import './Login.css';
import { useState } from 'react';
import { Tooltip } from "@radix-ui/themes";
import { Link, useNavigate } from "react-router-dom";
import mail from '../../../assets/icons/mail.svg';
import lock from '../../../assets/icons/lock.svg';
import eye_on from '../../../assets/icons/eye_on.svg';
import eye_off from '../../../assets/icons/eye_off.svg';
import NavBar from '../../../components/NavBar/NavBar.tsx';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage.tsx';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [viewPassword, setViewPassword] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;
            const uid = user.uid;
            const userDoc = await getDoc(doc(db, "users", uid));

            if (!userDoc.exists()) {
                throw new Error("User profile not found.");
            }

            const userData = userDoc.data();
            sessionStorage.setItem("currentUser", JSON.stringify(userData));


            if (userData.role === "employer") {
                navigate("/employer");
            } else {
                navigate("/employee");
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <div className="blob blob-1" />
            <div className="blob blob-3" />
            <NavBar login={false}/>
            <div className="login-wrapper">
                <h2>Cognition</h2>
                <div className="login-text">
                    <h3>Log in to Your Account</h3>
                    <div className="signup-text">
                        <span className="p">Don't have one? </span>
                        <Link to="/signup"> <span className="cta">Create a New Account.</span> </Link>
                    </div>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="input-wrapper">
                        <span className="input-icon">
                            <img src={mail} alt="mail icon"/>
                        </span>
                        <input type="email" required placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div className="password-wrapper">
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <img src={lock} alt="lock icon"/>
                            </span>
                            <input type={viewPassword ? "text" : "password"} required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                            <Tooltip content={viewPassword ? "Hide password" : "Show password"}>
                                <span className="eye-icon" onClick={() => setViewPassword(!viewPassword)}>
                                    <img src={viewPassword ? eye_on : eye_off} alt="view password icon"/>
                                </span>
                            </Tooltip>
                        </div>
                        <p className="cta">Forgot Password?</p>
                    </div>

                    {error && <ErrorMessage message={"Incorrect username or password. Please try again."} />}
                    <button className="signin-button" type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                </form>
            </div>
        </div>
    );
}