import React from "react";
import { useNavigate } from "react-router-dom";
import './Style.css';

const Start = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="container cloud-bg d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <div className="cloud-card text-center animate-fade-in">
                <h1 className="mb-4">You Have Successfully Logged In</h1>
                <h4 className="text-muted mb-4">Welcome to Your Cloud Storage Dashboard</h4>
                <button onClick={handleLogout} className="btn btn-primary">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Start;