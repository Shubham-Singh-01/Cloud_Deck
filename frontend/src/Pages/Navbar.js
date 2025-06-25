import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import "../Styles/Navbar.css";
import AuthContext from "../Context/Auth/AuthContext";

const Navbar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  const toggleNavbar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="cloud-navbar">
      <div className="cloud-navbar-container">
        <Link to="/" className="logo-link">
          <div className="logo-container">
            <div className="logo-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 19C3.79086 19 2 17.2091 2 15C2 12.7909 3.79086 11 6 11C6.25217 11 6.49823 11.0236 6.73564 11.0687M6.73564 11.0687C6.35869 10.4171 6.14286 9.67634 6.14286 8.89286C6.14286 6.19731 8.33016 4 11.0143 4C13.2112 4 15.0686 5.43139 15.6215 7.39439M6.73564 11.0687C7.2706 9.01736 9.09953 7.46429 11.2857 7.46429C11.5139 7.46429 11.7381 7.48094 11.9571 7.51328M15.6215 7.39439C15.9501 7.2971 16.2961 7.24457 16.6538 7.24457C19.0015 7.24457 20.9077 9.15076 20.9077 11.4985C20.9077 13.8462 19.0015 15.7524 16.6538 15.7524C16.2961 15.7524 15.9501 15.6999 15.6215 15.6026M15.6215 7.39439C16.2387 7.71273 16.7667 8.17826 17.1535 8.74687M11.9571 7.51328C13.4555 7.74364 14.6644 8.76047 15.1682 10.1282M11.9571 7.51328C14.1138 7.88363 15.7937 9.56346 16.1641 11.7201"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="logo-text">Cloud Deck</h3>
          </div>
        </Link>

        <button
          className={`cloud-navbar-toggler ${isExpanded ? "expanded" : ""}`}
          type="button"
          onClick={toggleNavbar}
          aria-controls="navbarContent"
          aria-expanded={isExpanded}
          aria-label="Toggle navigation"
        >
          <span className="toggler-icon"></span>
        </button>

        <div
          className={`cloud-navbar-collapse ${isExpanded ? "show" : ""}`}
          id="navbarContent"
        >
          <ul className="cloud-navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link" to="/start">Start</Link>
              </li>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/pricing">Pricing</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/features">Features</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">About</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">Contact</Link>
            </li>
          </ul>

          <div className="cloud-navbar-actions">
            {!isAuthenticated ? (
              <>
                <Link className="btn btn-login" to="/login">Log In</Link>
                <Link className="btn btn-signup" to="/signup">Sign Up</Link>
              </>
            ) : (
              <div className="user-menu">
                <div
                  className="user-profile"
                  onClick={() => setShowDropdown(prev => !prev)}
                  onBlur={() => setShowDropdown(false)}
                  tabIndex={0}
                >
                  <span className="user-name">{user?.name}</span>
                  <div className="user-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                </div>

                <div className={`dropdown-menu ${showDropdown ? "show" : ""}`}>
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/profile">Profile</Link>
                  <Link to="/settings">Settings</Link>
                  <Link to="/storage">Storage Usage</Link>
                  <hr />
                  <Link to="/" onClick={handleLogout}>Log Out</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
