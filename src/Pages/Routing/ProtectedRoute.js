import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../../Context/Auth/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="auth-form-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>Loading...</h3>
          <p>Please wait while we verify your credentials</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Render the protected component if authenticated
  return children;
};

export default ProtectedRoute;