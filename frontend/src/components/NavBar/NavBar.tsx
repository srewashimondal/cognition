import './NavBar.css';
import { Link } from "react-router-dom";
import logo from "../../assets/branding/cognition-logo.png";

type NavBarProps = {
    login?: boolean;
}

export default function NavBar({ login=true }: NavBarProps) {
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
            <Link className="hyper-link" to="/employer-onboarding"><p>Employer Onboarding</p></Link>
            <Link className="hyper-link" to="/employee-onboarding"><p>Employee Onboarding</p></Link>
        </div>
        <div className="login-div">
            {
                (login) && <Link to="/login">
                                <button className="login-button">Login</button>
                            </Link>
            }
        </div>
    </div>);
}