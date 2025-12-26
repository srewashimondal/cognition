import './NavBar.css';
import { Link } from "react-router-dom";
import logo from "../../assets/branding/logo.png";

export default function NavBar() {
    return (
    <div className="navbar">
        <div className="logo-div">
            <Link to="/">
                <img src={logo} alt="logo" className="logo"></img>
            </Link>
        </div>
        <div className="nav-div">
            <p>Why Cognition</p>
            <p>Products</p>
            <p>Pricing</p>
            <Link className="hyper-link" to="/EmployerDashBoard"><p>Employer DashBoard</p></Link>
            <Link className="hyper-link" to="/EmployeeDashBoard"><p>Employee DashBoard</p></Link>
        </div>
        <div className="login-div">
            <button className="login-button">Login</button>
        </div>
    </div>);
}