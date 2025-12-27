import './Login.css';
import { useState } from 'react';
import { Link } from "react-router-dom";
import mail from '../../../assets/icons/mail.svg';
import lock from '../../../assets/icons/lock.svg';
import eye_on from '../../../assets/icons/eye_on.svg';
import eye_off from '../../../assets/icons/eye_off.svg';
import NavBar from '../../../components/NavBar/NavBar.tsx';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [viewPassword, setViewPassword] = useState(false);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        console.log(email, password);
        {/* put in backend logic later */}
    }

    return (
        <div className="login-page">
            <div className="blob blob-1" />
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
                            <span className="eye-icon" onClick={() => setViewPassword(!viewPassword)}>
                                <img src={viewPassword ? eye_on : eye_off} alt="view password icon"/>
                            </span>
                        </div>
                        <p className="cta">Forgot Password?</p>
                    </div>

                    <button className="signin-button" type="submit">Sign in</button>
                </form>
            </div>
        </div>
    );
}