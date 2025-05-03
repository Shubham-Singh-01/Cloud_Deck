import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaGoogle, FaGithub } from "react-icons/fa";
import "../Styles/LoginSignup.css";
import AuthContext from "../Context/Auth/AuthContext";

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
  const { signup } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const { name, email, password, cpassword } = credentials;

    // Client-side validation
    let hasErrors = false;
    const newErrors = {};

    if (name.length < 5) {
      newErrors.name = "Name must be at least 5 characters";
      hasErrors = true;
    }

    if (password !== cpassword) {
      newErrors.cpassword = "Passwords do not match";
      hasErrors = true;
    }

    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await signup(name, email, password);
      
      if (result.success) {
        navigate("/Start");
      } else {
        // Handle specific error messages from API
        if (result.errors && Array.isArray(result.errors)) {
          // Parse validation errors from express-validator
          const errorMap = {};
          result.errors.forEach(err => {
            errorMap[err.param] = err.msg;
          });
          setErrors(errorMap);
        } else if (result.error && result.error.includes("email already exists")) {
          // Specific error for duplicate email
          setErrors({ email: "This email is already registered" });
        } else {
          // General error message
          setErrors({ form: result.error || "Failed to create account" });
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      // Handle Axios error responses
      if (error.response) {
        const { data } = error.response;
        if (data.error) {
          if (data.error.includes("email already exists")) {
            setErrors({ email: "This email is already registered" });
          } else {
            setErrors({ form: data.error });
          }
        } else {
          setErrors({ form: "Registration failed. Please try again." });
        }
      } else {
        setErrors({ form: "Unable to connect to server. Please try again later." });
      }
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
    if (errors.form) {
      setErrors({ ...errors, form: null });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-card auth-animate-in">
        <div className="auth-header">
          <h2 className="auth-title">Create an Account</h2>
          <p className="auth-subtitle">Join us to get started</p>
        </div>
        
        {errors.form && (
          <div className="auth-form-error" style={{ marginBottom: '1rem', textAlign: 'center' }}>
            {errors.form}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="name" className="auth-form-label">
              Full Name
            </label>
            <input
              type="text"
              className={`auth-form-input ${errors.name ? "error" : ""}`}
              id="name"
              name="name"
              value={credentials.name}
              onChange={onChange}
              placeholder="John Doe"
              required
              minLength={5}
            />
            {errors.name && <div className="auth-form-error">{errors.name}</div>}
          </div>
          
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
              minLength={8}
              required
            />
            {errors.password && <div className="auth-form-error">{errors.password}</div>}
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
              className={`auth-form-input ${errors.cpassword ? "error" : ""}`}
              id="cpassword"
              name="cpassword"
              value={credentials.cpassword}
              onChange={onChange}
              placeholder="••••••••"
              minLength={8}
              required
            />
            {errors.cpassword && <div className="auth-form-error">{errors.cpassword}</div>}
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