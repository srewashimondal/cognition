import './NavBar.css';
import { Link } from "react-router-dom";
import logo from "../../assets/branding/cognition-logo.png";

type NavBarProps = {
    login?: boolean;
    isAuthenticated?: boolean;
    role?: "employer" | "employee";
}

export default function NavBar({ login=true, isAuthenticated=false, role }: NavBarProps) {
    return (
    <div className="navbar">
        <div className="logo-div">
            <Link to="/">
                <img src={logo} alt="logo" className="logo"></img>
            </Link>
        </div>
        <div className="nav-div">
            {/*<p>Why Cognition</p>
            <p>Products</p>
            <p>Pricing</p>*/}
            <Link className="hyper-link" to="/employer"><p>Employer DashBoard</p></Link>
            <Link className="hyper-link" to="/employee"><p>Employee DashBoard</p></Link>
            <Link className="hyper-link" to="/join/employer"><p>Employer Onboarding</p></Link>
            <Link className="hyper-link" to="/join/employee"><p>Employee Onboarding</p></Link>
        </div>
        <div className="login-div">
            {
            (login && !isAuthenticated) && <Link to="/login">
                            <button className="login-button">Login</button>
                        </Link>
            }
            {(isAuthenticated) &&
                <Link to={role === "employer" ? "/employer" : "/employee"}>
                    <button className="login-button">Go to Dashboard →</button>
                </Link>
            }
        </div>
    </div>);
}