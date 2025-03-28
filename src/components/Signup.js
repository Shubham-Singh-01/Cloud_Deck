import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import './Style.css';

const Signup = () => {
    const [credentials, setCredentials] = useState({
        name: "",
        email: "",
        password: "",
        cpassword: ""
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password, cpassword } = credentials;

        if (password !== cpassword) {
            alert("Passwords do not match");
            return;
        }

        const response = await fetch("http://localhost:5000/api/auth/createuser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password })
        });

        if (response.ok) {
            const json = await response.json();
            console.log(json);

            localStorage.setItem('token', json.authtoken);
            navigate("/Start");
        } else {
            alert("Failed to create user");
        }
    };

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    return (
        <div className="container cloud-bg d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <div className="form-container animate-fade-in">
                <h2 className="text-center mb-4">Create Your Account</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="name" 
                            name="name" 
                            onChange={onChange} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email address</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            id="email" 
                            onChange={onChange} 
                            name="email" 
                            aria-describedby="emailHelp" 
                            required 
                        />
                        <small id="emailHelp" className="form-text">We'll never share your email with anyone else.</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            name="password" 
                            id="password" 
                            onChange={onChange} 
                            minLength={8} 
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="cpassword" className="form-label">Confirm Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            name="cpassword" 
                            id="cpassword" 
                            onChange={onChange} 
                            minLength={8} 
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 mt-3">Sign Up</button>
                    <div className="text-center mt-3">
                        <small>Already have an account? <Link to="/login" className="text-primary">Login</Link></small>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;