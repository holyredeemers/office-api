const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('public/uploads')); // Serve images
app.use('/events', express.static(path.join(__dirname, 'public/events'))); // serve images

// Routes
const carouselRoutes = require('./routes/carousel');
const eventRoutes = require('./routes/events');
const feedbackRoutes = require('./routes/feedback'); // or wherever your file is
const { connectDB } = require('./db');
app.use('/api/carousel', carouselRoutes);
app.use('/api/events', eventRoutes); // for POST/GET
app.use('/api/feedback', feedbackRoutes); 

connectDB();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
