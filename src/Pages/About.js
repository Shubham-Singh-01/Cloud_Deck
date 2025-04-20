import React from 'react';
import { ShieldCheck, UserPlus, Database, Palette } from 'lucide-react';
import '../Styles/About.css';

const About = () => {
  const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="feature-card">
      <div className="feature-icon">
        <Icon className="icon" />
      </div>
      <div className="feature-content">
        <h3 className="feature-title">{title}</h3>
        <p className="feature-description">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="about-page">
      <div className="about-header">
        <h1>Cloud Deck</h1>
        <p>A comprehensive, secure, and intuitive Cloud Storage solution designed to protect and streamline your cloud storage experience.</p>
      </div>

      <div className="features-grid">
        <FeatureCard
          icon={ShieldCheck}
          title="Uncompromising Security"
          description="Advanced encryption and rigorous security protocols safeguard your sensitive data throughout the authentication process."
        />
        <FeatureCard
          icon={UserPlus}
          title="User-Friendly Design"
          description="Intuitive interfaces ensure a smooth, hassle-free login and signup experience for users of all technical backgrounds."
        />
        <FeatureCard
          icon={Database}
          title="Reliable Infrastructure"
          description="Powered by robust database technologies, delivering scalable, performant, and redundant user management."
        />
        <FeatureCard
          icon={Palette}
          title="Flexible Customization"
          description="Easily integrate and adapt our authentication system to meet the unique requirements of your specific project."
        />
      </div>

      <div className="about-footer">
        <p>Experience cloud storage authentication reimagined – secure, simple, and sophisticated.</p>
      </div>
    </div>
  );
};

export default About;