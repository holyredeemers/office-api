const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');
const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const titleSlug = req.body.title.toLowerCase().replace(/\s+/g, '-');
    const dir = `public/events/${titleSlug}`;
    const fs = require('fs');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Keep original file names
  }
});

const upload = multer({ storage });

router.post('/add', upload.array('images', 4), async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const titleSlug = title.toLowerCase().replace(/\s+/g, '-');
    const imgPaths = req.files.map(file => `/events/${titleSlug}/${file.originalname}`);

    // Fill with nulls if fewer than 4 images
    while (imgPaths.length < 4) imgPaths.push(null);

    const result = await pool.query(
      `INSERT INTO tbl_events (title, description, date, image1, image2, image3, image4)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, date, ...imgPaths]
    );

    res.status(201).json({ message: 'Event created successfully', event: result.rows[0] });
  } catch (err) {
    console.error('Error adding event:', err);
    res.status(500).send('Server Error');
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM tbl_events ORDER BY date DESC`);
    const events = result.rows.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date,
      images: [e.image1, e.image2, e.image3, e.image4].filter(img => img)
    }));
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/recent', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM tbl_events ORDER BY created_at DESC LIMIT 4`
    );

    const events = result.rows.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date,
      created_at: e.created_at,
      images: [e.image1, e.image2, e.image3, e.image4].filter(img => img)
    }));

    res.json(events);
  } catch (err) {
    console.error('Error fetching recent events:', err);
    res.status(500).send('Server Error');
  }
});

// routes/events.js
router.delete('/:id', async (req, res) => {
  const eventId = req.params.id;
  try {
    const result = await pool.query(
      'SELECT title FROM tbl_events WHERE id = $1',
      [eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const titleSlug = result.rows[0].title.toLowerCase().replace(/\s+/g, '-');
    const folderPath = path.join(__dirname, '../public/events', titleSlug);

    await pool.query('DELETE FROM tbl_events WHERE id = $1', [eventId]);

    const fs = require('fs');
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
