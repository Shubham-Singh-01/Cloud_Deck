const jwt = require("jsonwebtoken");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const JWT_SECRET = process.env.JWT_SECRET 

const fetchuser = (req, res, next) => {
  const token = req.header('auth-token');
  console.log('Token received:', token); // Debug
  if (!token) {
    return res.status(401).send({ error: 'Please authenticate using a valid token' });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    console.log('Decoded user:', data.user); // Debug
    req.user = data.user;
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message); // Debug
    return res.status(401).send({ error: 'Please authenticate using a valid token' });
  }
};

module.exports = fetchuser;