// src/routes/events.js
const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /events
 * body: { college_id, name, type, date (ISO), capacity }
 * returns created event
 */
router.post('/', (req, res, next) => {
  try {
    const { college_id, name, type, date, capacity } = req.body;
    if (!college_id || !name) return res.status(400).json({ error: 'college_id and name required' });

    const id = `${college_id}::${uuidv4()}`;
    const stmt = db.prepare(`INSERT INTO events (id, college_id, name, type, date, capacity) VALUES (?, ?, ?, ?, ?, ?)`);
    stmt.run(id, college_id, name, type || null, date || null, capacity || null);

    const created = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /events
 * optional query: college_id
 */
router.get('/', (req, res, next) => {
  try {
    const { college_id } = req.query;
    let rows;
    if (college_id) {
      rows = db.prepare('SELECT * FROM events WHERE college_id = ?').all(college_id);
    } else {
      rows = db.prepare('SELECT * FROM events').all();
    }
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
