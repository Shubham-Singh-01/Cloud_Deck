// src/App.js
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Navbar from './Pages/Navbar';
import Home from './Pages/Home';
import Start from './Pages/Start';
import About from './Pages/About';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import ProtectedRoute from './Pages/Routing/ProtectedRoute';
import { AuthProvider } from './Context/Auth/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/start" 
            element={
              <ProtectedRoute>
                <Start />
              </ProtectedRoute>
            } 
          />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;