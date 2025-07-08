const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const path = require('path');

const app = express();

// Load self-signed SSL cert & key
const sslOptions = {
  key: fs.readFileSync('/home/ubuntu/ssl/key.pem'),     // adjust path if different
  cert: fs.readFileSync('/home/ubuntu/ssl/cert.pem')
};

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('public/uploads'));
app.use('/events', express.static(path.join(__dirname, 'public/events')));

// Routes
const carouselRoutes = require('./routes/carousel');
const eventRoutes = require('./routes/events');
const feedbackRoutes = require('./routes/feedback');
const { connectDB } = require('./db');

app.use('/api/carousel', carouselRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/feedback', feedbackRoutes);

connectDB();

// Start HTTPS server on port 443
const PORT = 443;
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`✅ HTTPS Server running at https://localhost:${PORT}`);
});
