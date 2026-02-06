import './Signup.css';
import { useState } from 'react';
import { Link } from "react-router-dom";
import { Tooltip } from "@radix-ui/themes";
import mail from '../../../assets/icons/mail.svg';
import lock from '../../../assets/icons/lock.svg';
import eye_on from '../../../assets/icons/eye_on.svg';
import eye_off from '../../../assets/icons/eye_off.svg';
import gradient from '../../../assets/illustrations/gradient.jpg';
import NavBar from '../../../components/NavBar/NavBar.tsx';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage.tsx';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase";
import { useNavigate } from "react-router-dom";


type SignupProps = {
    role: "employee" | "employer";
}

export default function Signup({ role="employee" }: SignupProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [reEnteredPassword, setReEnteredPassword] = useState("");
    const [viewPassword, setViewPassword] = useState(false);
    const [viewReEnteredPassword, setViewReEnteredPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (password !== reEnteredPassword) {
            setError("Passwords must match.");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;

            if (role === "employer") {
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
        <div className="signup-page">
            <NavBar login={false} />
            <div className="signup-wrapper">
                <div className="gradient-img-container">
                    <img src={gradient} alt="gradient"/>
                    <div className="overlay-text">
                        <div className="small-overlay">{(role === "employee") ? "Your retail training workspace," : "Create an environment"}</div>
                        <div className="big-overlay">{(role === "employee") ? "organzied and ready when you are." : "where your employees can grow."}</div>
                    </div>
                </div>
                <div className="signup-div">
                    <h2>Cognition</h2>
                    <div className="login-text">
                        <div className="role-selection">
                            <Link to="/signup/employee/">
                                <span className={`role-pick ${(role === "employee") ? "selected" : ""}`}>Sign Up as Employee</span>
                            </Link>
                            <span> | </span>
                            <Link to="/signup/employer/">
                                <span className={`role-pick ${(role === "employer") ? "selected" : ""}`}>Sign Up as Employer</span>
                            </Link>
                        </div>
                        <h3>{(role === "employee") ? "Employee Sign Up" : "Employer Sign Up"}</h3>
                        <div className="signup-text">
                            <span className="p">Already have one? </span>
                            <Link to="/login"><span className="cta">Login to Your Account.</span></Link>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <img src={mail} alt="mail icon"/>
                            </span>
                            <input type="email" required placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)}/>
                        </div>
                        
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

                        <div className="password-wrapper">
                            <div className="input-wrapper">
                                    <span className="input-icon">
                                        <img src={lock} alt="lock icon"/>
                                    </span>
                                    <input type={viewReEnteredPassword ? "text" : "password"} required placeholder="Re-enter Password" value={reEnteredPassword} onChange={(e) => setReEnteredPassword(e.target.value)}/>
                                    <Tooltip content={viewReEnteredPassword ? "Hide password" : "Show password"}>
                                        <span className="eye-icon" onClick={() => setViewReEnteredPassword(!viewReEnteredPassword)}>
                                            <img src={viewReEnteredPassword ? eye_on : eye_off} alt="view password icon"/>
                                        </span>
                                    </Tooltip>
                            </div>
                            {(reEnteredPassword) && (password !== reEnteredPassword) && (<ErrorMessage message={"Passwords must match."} />)}
                        </div>
                        {error && <ErrorMessage message={error} />}
                        <button className="signin-button" type="submit" disabled={loading}>
                            {loading ? "Creating account..." : "Create Account"}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}