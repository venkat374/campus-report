// src/routes/attendance.js
const express = require('express');
const router = express.Router();
const { db } = require('../db');

/**
 * POST /attendance
 * body: { event_id, student_id }
 */
router.post('/', (req, res, next) => {
  try {
    const { event_id, student_id } = req.body;
    if (!event_id || !student_id) return res.status(400).json({ error: 'event_id and student_id required' });

    // simple validation: event exists
    const ev = db.prepare('SELECT * FROM events WHERE id = ?').get(event_id);
    if (!ev) return res.status(404).json({ error: 'event not found' });

    // optional: only allow attendance if registered - you may change this behavior
    const reg = db.prepare('SELECT * FROM registrations WHERE event_id = ? AND student_id = ?').get(event_id, student_id);
    if (!reg) return res.status(400).json({ error: 'student not registered for this event' });

    // Insert attendance (duplicates allowed — but you may want to dedupe)
    const already = db.prepare('SELECT * FROM attendance WHERE event_id = ? AND student_id = ?').get(event_id, student_id);
    if (already) return res.status(409).json({ error: 'attendance already marked' });

    const stmt = db.prepare('INSERT INTO attendance (event_id, student_id) VALUES (?, ?)');
    const info = stmt.run(event_id, student_id);
    const created = db.prepare('SELECT * FROM attendance WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
