// src/routes/feedback.js
const express = require('express');
const router = express.Router();
const { db } = require('../db');

/**
 * POST /feedback
 * body: { event_id, student_id, rating (1-5), comment? }
 */
router.post('/', (req, res, next) => {
  try {
    const { event_id, student_id, rating, comment } = req.body;
    if (!event_id || !student_id || rating == null) return res.status(400).json({ error: 'event_id, student_id and rating required' });
    if (!(Number.isInteger(rating) && rating >= 1 && rating <= 5)) return res.status(400).json({ error: 'rating must be integer 1..5' });

    // optional: allow only if attended — currently we don't enforce, but could check attendance
    // try insert; UNIQUE(event_id, student_id) prevents duplicate feedback
    try {
      const stmt = db.prepare('INSERT INTO feedback (event_id, student_id, rating, comment) VALUES (?, ?, ?, ?)');
      const info = stmt.run(event_id, student_id, rating, comment || null);
      const created = db.prepare('SELECT * FROM feedback WHERE id = ?').get(info.lastInsertRowid);
      res.status(201).json(created);
    } catch (e) {
      if (e.message && e.message.includes('UNIQUE')) return res.status(409).json({ error: 'feedback already submitted for this student on this event' });
      throw e;
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
