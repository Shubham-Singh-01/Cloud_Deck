import React from 'react';
import { Link } from 'react-router-dom';
import './Style.css';

const Home = () => {
  return (
    <div className="container cloud-bg d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="cloud-card text-center animate-fade-in">
        <h1 className="mb-4">Welcome to Cloud Deck</h1>
        <h5 className="text-muted mb-4">Secure, Simple, and Reliable</h5>
      </div>
    </div>
  );
};

export default Home;