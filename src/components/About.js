import React from 'react';

const About = () => {
  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title text-center mb-4">About Our Authentication System</h1>
              <p>
                At [Your App Name], we're dedicated to providing a secure and seamless experience for our users. Our authentication system, powered by MongoDB and React.js, ensures that your personal data is protected while offering user-friendly login and signup processes.
              </p>
              <h2>Why Choose Our Authentication System?</h2>
              <ul>
                <li>
                  <strong>Security:</strong> We prioritize your online security. Our robust authentication system employs industry best practices to keep your data safe. Your passwords and sensitive information are securely stored using MongoDB's advanced encryption.
                </li>
                <li>
                  <strong>User-Friendly:</strong> We understand the importance of a smooth user experience. Our login and signup pages are designed to be intuitive and easy to use, ensuring a hassle-free onboarding process.
                </li>
                <li>
                  <strong>Reliability:</strong> MongoDB, a leading NoSQL database, powers our system. This database offers scalability, redundancy, and performance, guaranteeing reliability for our users.
                </li>
                <li>
                  <strong>Customization:</strong> We've designed our authentication system to be flexible and adaptable. You can easily integrate it into your own projects, tailoring it to your specific needs.
                </li>
              </ul>
              <h2>How It Works</h2>
              <p>
                <strong>Login:</strong> Use your registered email and password to access your account securely. We verify your credentials against our encrypted database to ensure the highest level of protection.
              </p>
              <p>
                <strong>Signup:</strong> Creating a new account is straightforward. Provide your name, email, and a secure password, and we'll store your details safely in our MongoDB database.
              </p>
              <h2>Our Commitment to Privacy</h2>
              <p>
                Your privacy is a priority. We never share your personal information with third parties. With our MongoDB-backed authentication system, your data remains confidential and protected.
              </p>
              <p>
                Join us today and experience the seamless and secure login and signup process brought to you by [Your App Name]!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
