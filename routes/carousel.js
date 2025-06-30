const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const multer = require('multer');
const path = require('path');

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

/**
 * GET /api/carousel
 * Returns all active carousel items
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tbl_carousel WHERE is_active = true ORDER BY display_order ASC NULLS LAST'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch carousel data');
  }
});

/**
 * POST /api/carousel
 * Upload a new carousel item
 */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    await pool.query(
      'INSERT INTO tbl_carousel (image_path, title, description) VALUES ($1, $2, $3)',
      [imagePath, title, description]
    );

    res.status(201).json({ message: 'Carousel entry created' });

  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).send('Error uploading carousel entry');
  }
});

/**
 * DELETE /api/carousel/:id
 * Deletes a carousel item by ID
 */
router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query('DELETE FROM tbl_carousel WHERE id = $1', [id]);
    res.status(200).json({ message: 'Carousel item deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting carousel entry');
  }
});

module.exports = router;
