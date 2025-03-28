import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import './Style.css';

const Login = () => {
    const [credentials, setCredential] = useState({email: "",password: ""})
    let navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:5000/api/auth/Login", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({email: credentials.email, password: credentials.password})
      });
    const json = await response.json();
    console.log(json);
    if (json.success){
      localStorage.setItem('token', json.authtoken); 
      navigate("/Start");
    }
    else{
      alert("Invalid credentials");
    }
  }

  const onChange = (e)=>{
    setCredential({...credentials, [e.target.name]: e.target.value})
  }

  return (
    <div className="container cloud-bg d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="form-container animate-fade-in">
        <h2 className="text-center mb-4">Login to Your Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <input 
              type="email" 
              className="form-control" 
              value={credentials.email} 
              onChange={onChange} 
              id="email" 
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
              value={credentials.password} 
              onChange={onChange} 
              name="password" 
              id="password" 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-3">Login</button>
          <div className="text-center mt-3">
            <small>Don't have an account? <Link to="/signup" className="text-primary">Sign Up</Link></small>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login