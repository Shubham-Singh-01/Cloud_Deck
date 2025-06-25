import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import "../Styles/Home.css";

const Home = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="hero-container">
        {/* Moved particle container outside of logo area */}
        <div className="particle-container">
          {[...Array(20)].map((_, index) => (
            <div
              key={index}
              className={`particle particle-${index % 5}`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            ></div>
          ))}
        </div>

        <div className={`content-wrapper ${loaded ? "visible" : ""}`}>
          <div className="hero-content">
            <h1 className="hero-title">
              Your Data, <span className="gradient-text">Elevated</span>
            </h1>
            <p className="hero-subtitle">
              Secure, intelligent cloud solutions for modern businesses
            </p>

            <div className="cta-container">
              <a href="/Login" className="btn-primary">
                Get Started
              </a>
              <a href="/About" className="btn-secondary">
                Learn More
              </a>
            </div>
          </div>

          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h4>Enterprise Security</h4>
              <p>Bank-level encryption and advanced threat protection</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z" />
                </svg>
              </div>
              <h4>Global Network</h4>
              <p>Lightning-fast access from anywhere in the world</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                  <line x1="16" y1="8" x2="2" y2="22" />
                  <line x1="17.5" y1="15" x2="9" y2="15" />
                </svg>
              </div>
              <h4>Smart Management</h4>
              <p>Intuitive tools that adapt to your workflow</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Middle Section */}
      <div className="company-section">
        <div className="section-header">
          <h2>
            Why Choose <span className="gradient-text">Cloud Deck</span>
          </h2>
          <p>Powering innovation for businesses worldwide since 2022</p>
        </div>

        <div className="company-stats">
          <div className="stat-item">
            <h3>99.99%</h3>
            <p>Uptime Guarantee</p>
          </div>
          <div className="stat-item">
            <h3>5,000+</h3>
            <p>Active Customers</p>
          </div>
          <div className="stat-item">
            <h3>24/7</h3>
            <p>Expert Support</p>
          </div>
          <div className="stat-item">
            <h3>50+</h3>
            <p>Global Data Centers</p>
          </div>
        </div>

        <div className="testimonial-section">
          <div className="testimonial">
            <div className="quote-mark">"</div>
            <p>
              Cloud Deck transformed our infrastructure overnight. We've seen a
              40% reduction in costs and 200% improvement in performance.
            </p>
            <div className="testimonial-author">
              <div className="author-avatar"></div>
              <div className="author-info">
                <h4>Sarah Johnson</h4>
                <p>CTO, TechGrowth</p>
              </div>
            </div>
          </div>

          <div className="testimonial">
            <div className="quote-mark">"</div>
            <p>
              The migration was seamless, and the ongoing support has been
              exceptional. Cloud Deck understands enterprise needs like no other
              provider.
            </p>
            <div className="testimonial-author">
              <div className="author-avatar"></div>
              <div className="author-info">
                <h4>Michael Chen</h4>
                <p>IT Director, Global Solutions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="partners-section">
          <h3>Trusted By Industry Leaders</h3>
          <div className="partner-logos">
            {/* Placeholder for partner logos */}
            {[...Array(6)].map((_, index) => (
              <div key={index} className="partner-logo"></div>
            ))}
          </div>
        </div>
      </div>

      {/* New Footer Section */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
              >
                <path
                  d="M6 19C3.79086 19 2 17.2091 2 15C2 12.7909 3.79086 11 6 11C6.25217 11 6.49823 11.0236 6.73564 11.0687M6.73564 11.0687C6.35869 10.4171 6.14286 9.67634 6.14286 8.89286C6.14286 6.19731 8.33016 4 11.0143 4C13.2112 4 15.0686 5.43139 15.6215 7.39439M6.73564 11.0687C7.2706 9.01736 9.09953 7.46429 11.2857 7.46429C11.5139 7.46429 11.7381 7.48094 11.9571 7.51328M15.6215 7.39439C15.9501 7.2971 16.2961 7.24457 16.6538 7.24457C19.0015 7.24457 20.9077 9.15076 20.9077 11.4985C20.9077 13.8462 19.0015 15.7524 16.6538 15.7524C16.2961 15.7524 15.9501 15.6999 15.6215 15.6026M15.6215 7.39439C16.2387 7.71273 16.7667 8.17826 17.1535 8.74687M11.9571 7.51328C13.4555 7.74364 14.6644 8.76047 15.1682 10.1282M11.9571 7.51328C14.1138 7.88363 15.7937 9.56346 16.1641 11.7201"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <h3>Cloud Deck</h3>
            </div>
            <p>Transforming business through cloud innovation</p>
            <div className="social-links">
              <a href="https://info.cern.ch/hypertext/WWW/TheProject.html" className="social-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="https://x.com/Shubham_Singh_l" className="social-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/singh200410/" className="social-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Products</h4>
              <ul>
                <li>
                  <a href="/">Cloud Storage</a>
                </li>
                <li>
                  <a href="/">Computing</a>
                </li>
                <li>
                  <a href="/">Databases</a>
                </li>
                <li>
                  <a href="/">Analytics</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                <li>
                  <a href="/">About Us</a>
                </li>
                <li>
                  <a href="/">Careers</a>
                </li>
                <li>
                  <a href="/">Press</a>
                </li>
                <li>
                  <a href="/">Blog</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Resources</h4>
              <ul>
                <li>
                  <a href="/">Documentation</a>
                </li>
                <li>
                  <a href="/">API Reference</a>
                </li>
                <li>
                  <a href="/">Status</a>
                </li>
                <li>
                  <a href="/">Security</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Support</h4>
              <ul>
                <li>
                  <a href="/helpcenter">Help Center</a>
                </li>
                <li>
                  <a href="/Contactus">Contact Us</a>
                </li>
                <li>
                  <a href="/Community">Community</a>
                </li>
                <li>
                  <a href="/training">Training</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Cloud Deck, Inc. All rights reserved.</p>
          <div className="legal-links">
            <a href="/privacypolicy">Privacy Policy</a>
            <a href="/termsofservice">Terms of Service</a>
            <a href="/cookiepolicy">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
