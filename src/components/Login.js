import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaGoogle, FaGithub } from "react-icons/fa";
import "../Styles/LoginSignup.css";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  let navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading state
    
    // Original login logic
    const response = await fetch("http://localhost:5000/api/auth/Login", {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({email: credentials.email, password: credentials.password})
    });
    
    const json = await response.json();
    console.log(json);
    
    setLoading(false); // Hide loading state regardless of result
    
    if (json.success){
      localStorage.setItem('token', json.authtoken); 
      navigate("/Start");
    }
    else{
      alert("Invalid credentials");
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
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to access your account</p>
        </div>
        
        {errors.form && (
          <div className="auth-form-error" style={{ marginBottom: '1rem', textAlign: 'center' }}>
            {errors.form}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="email" className="auth-form-label">
              Email Address
            </label>
            <input
              type="email"
              className={`auth-form-input ${errors.email ? "error" : ""}`}
              id="email"
              name="email"
              value={credentials.email}
              onChange={onChange}
              placeholder="you@example.com"
              required
            />
            {errors.email && <div className="auth-form-error">{errors.email}</div>}
          </div>
          
          <div className="auth-form-group">
            <label htmlFor="password" className="auth-form-label">
              Password
            </label>
            <input
              type="password"
              className={`auth-form-input ${errors.password ? "error" : ""}`}
              id="password"
              name="password"
              value={credentials.password}
              onChange={onChange}
              placeholder="••••••••"
              required
            />
            {errors.password && <div className="auth-form-error">{errors.password}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
              <Link to="/forgot-password" style={{ fontSize: "0.85rem", color: "#6366f1", textDecoration: "none" }}>
                Forgot password?
              </Link>
            </div>
          </div>
          
          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
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
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;