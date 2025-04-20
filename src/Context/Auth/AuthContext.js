import { createContext, useState, useEffect } from 'react';
import api from '../../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      if (localStorage.getItem('token')) {
        try {
          const response = await api.post('/api/auth/getuser');
          if (response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.authtoken);
        const userResponse = await api.post('/api/auth/getuser');
        setUser(userResponse.data);
        setIsAuthenticated(true);
        return { success: true };
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await api.post('/api/auth/createuser', { name, email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.authtoken);
        const userResponse = await api.post('/api/auth/getuser');
        setUser(userResponse.data);
        setIsAuthenticated(true);
        return { success: true };
      }
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An error occurred during signup' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;