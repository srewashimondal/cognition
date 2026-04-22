import './ForgotPassword.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import mail from '../../../assets/icons/mail.svg';
import NavBar from '../../../components/NavBar/NavBar.tsx';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage.tsx';
import { auth } from '../../../firebase';

function friendlyAuthMessage(code: string): string {
    switch (code) {
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        default:
            return 'Something went wrong. Please try again.';
    }
}

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const trimmed = email.trim();

        try {
            await sendPasswordResetEmail(auth, trimmed);
            setSent(true);
        } catch (err) {
            if (err instanceof FirebaseError) {
                if (err.code === 'auth/user-not-found') {
                    setSent(true);
                } else {
                    setError(friendlyAuthMessage(err.code));
                }
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <div className="blob blob-1" />
            <NavBar login={false} />
            <div className="login-wrapper">
                <h2>Cognition</h2>
                <div className="login-text">
                    <h3>Reset your password</h3>
                    <div className="signup-text">
                        <span className="p">Remember it? </span>
                        <Link to="/login">
                            <span className="cta forgot-password-back">Back to sign in</span>
                        </Link>
                    </div>
                </div>
                {sent ? (
                    <p className="forgot-success">
                        If an account exists for that email, you’ll receive a link to reset your password
                        shortly.
                    </p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <img src={mail} alt="" />
                            </span>
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                placeholder="E-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {error && <ErrorMessage message={error} />}
                        <button className="signin-button" type="submit" disabled={loading}>
                            {loading ? 'Sending…' : 'Send reset link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
