const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Submit feedback (POST)
router.post('/', async (req, res) => {
  const { name, year, occupation, comment } = req.body;
  try {
    await pool.query(
      'INSERT INTO tbl_feedback (name, year, occupation, comment) VALUES ($1, $2, $3, $4)',
      [name, year, occupation, comment]
    );
    res.status(201).json({ message: 'Feedback submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get approved feedback
router.get('/approved', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tbl_feedback WHERE isApproved = true ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get unapproved feedback for admin
router.get('/pending', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tbl_feedback WHERE isApproved = false ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve feedback
router.put('/approve/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query(
      'UPDATE tbl_feedback SET isApproved = true WHERE id = $1',
      [id]
    );
    res.json({ message: 'Feedback approved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete feedback
router.delete('/feedbacks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM tbl_feedback WHERE id = $1', [id]);
    res.status(200).json({ message: 'Feedback deleted successfully.' });
  } catch (err) {
    console.error('Error deleting feedback:', err);
    res.status(500).json({ error: 'Failed to delete feedback.' });
  }
});

module.exports = router;
