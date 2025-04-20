// src/context/auth/AuthContext.js
import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user is authenticated on load
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      if (localStorage.getItem('token')) {
        try {
          // Get user data if token exists
          const response = await fetch('http://localhost:5000/api/auth/getuser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'auth-token': localStorage.getItem('token')
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token not valid
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          console.error("Error checking authentication:", error);
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    checkUserLoggedIn();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.authtoken);
        
        // Get user data
        const userResponse = await fetch('http://localhost:5000/api/auth/getuser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': data.authtoken
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          setIsAuthenticated(true);
          return { success: true };
        }
      }
      return data;
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "An error occurred during login" };
    }
  };
  
  // Signup function
  const signup = async (name, email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/createuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.authtoken);
        
        // Get user data
        const userResponse = await fetch('http://localhost:5000/api/auth/getuser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': data.authtoken
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          setIsAuthenticated(true);
          return { success: true };
        }
      }
      return data;
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: "An error occurred during signup" };
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user, 
        loading,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;