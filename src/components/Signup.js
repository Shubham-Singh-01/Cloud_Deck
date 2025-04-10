import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaGoogle, FaGithub } from "react-icons/fa";
import "../Styles/LoginSignup.css";

const Signup = () => {
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, cpassword } = credentials;

    if (password !== cpassword) {
      alert("Passwords do not match");
      return;
    }
    
    setLoading(true); // Show loading state
    
    // Original signup logic
    const response = await fetch("http://localhost:5000/api/auth/createuser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password })
    });

    setLoading(false); // Hide loading state regardless of result
    
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
    
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-card auth-animate-in">
        <div className="auth-header">
          <h2 className="auth-title">Create an Account</h2>
          <p className="auth-subtitle">Join us to get started</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="name" className="auth-form-label">
              Full Name
            </label>
            <input
              type="text"
              className="auth-form-input"
              id="name"
              name="name"
              value={credentials.name}
              onChange={onChange}
              placeholder="John Doe"
              required
            />
          </div>
          
          <div className="auth-form-group">
            <label htmlFor="email" className="auth-form-label">
              Email Address
            </label>
            <input
              type="email"
              className="auth-form-input"
              id="email"
              name="email"
              value={credentials.email}
              onChange={onChange}
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div className="auth-form-group">
            <label htmlFor="password" className="auth-form-label">
              Password
            </label>
            <input
              type="password"
              className="auth-form-input"
              id="password"
              name="password"
              value={credentials.password}
              onChange={onChange}
              placeholder="••••••••"
              minLength={8}
              required
            />
            <small className="auth-form-hint">
              Use at least 8 characters with one uppercase letter, one lowercase letter, and one number
            </small>
          </div>
          
          <div className="auth-form-group">
            <label htmlFor="cpassword" className="auth-form-label">
              Confirm Password
            </label>
            <input
              type="password"
              className="auth-form-input"
              id="cpassword"
              name="cpassword"
              value={credentials.cpassword}
              onChange={onChange}
              placeholder="••••••••"
              minLength={8}
              required
            />
          </div>
          
          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
          
          <div className="auth-separator">
            <span className="auth-separator-text">Or continue with</span>
          </div>
          
          <div className="auth-social-buttons">
            <button type="button" className="auth-social-button">
              <FaGoogle />
            </button>
            <button type="button" className="auth-social-button">
              <FaGithub />
            </button>
          </div>
          
          <div className="auth-alt-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;