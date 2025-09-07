// src/routes/registrations.js
const express = require('express');
const router = express.Router();
const { db } = require('../db');

/**
 * POST /registrations
 * body: { event_id, student_id }
 * OR use POST /events/:eventId/register in some clients (not implemented here)
 */
router.post('/', (req, res, next) => {
  try {
    const { event_id, student_id } = req.body;
    if (!event_id || !student_id) return res.status(400).json({ error: 'event_id and student_id required' });

    // check event exists and not cancelled
    const ev = db.prepare('SELECT * FROM events WHERE id = ?').get(event_id);
    if (!ev) return res.status(404).json({ error: 'event not found' });
    if (ev.cancelled) return res.status(400).json({ error: 'event is cancelled' });

    // optional: check capacity
    if (ev.capacity) {
      const regCount = db.prepare('SELECT COUNT(*) as c FROM registrations WHERE event_id = ?').get(event_id).c;
      if (regCount >= ev.capacity) return res.status(400).json({ error: 'event capacity reached' });
    }

    try {
      const stmt = db.prepare('INSERT INTO registrations (event_id, student_id) VALUES (?, ?)');
      const info = stmt.run(event_id, student_id);
      const created = db.prepare('SELECT * FROM registrations WHERE id = ?').get(info.lastInsertRowid);
      res.status(201).json(created);
    } catch (e) {
      // likely UNIQUE constraint violation => duplicate registration
      if (e.message && e.message.includes('UNIQUE')) return res.status(409).json({ error: 'student already registered for this event' });
      throw e;
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
