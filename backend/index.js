require('dotenv').config();
const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

connectToMongo();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Available Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/uploads', require('./routes/Uploads'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const path = require('path');

// Serve static frontend (React) build
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
