// src/routes/students.js
const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /students
 * body: { college_id, name, email, id? }
 * If id not provided, auto-generate as `${college_id}::${uuid}`
 */
router.post('/', (req, res, next) => {
  try {
    const { college_id, name, email, id } = req.body;
    if (!college_id || !name) return res.status(400).json({ error: 'college_id and name required' });

    const studentId = id || `${college_id}::${uuidv4()}`;
    const stmt = db.prepare('INSERT INTO students (id, college_id, name, email) VALUES (?, ?, ?, ?)');
    stmt.run(studentId, college_id, name, email || null);

    const created = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /students
 * optional query: college_id
 */
router.get('/', (req, res, next) => {
  try {
    const { college_id } = req.query;
    let rows;
    if (college_id) {
      rows = db.prepare('SELECT * FROM students WHERE college_id = ?').all(college_id);
    } else {
      rows = db.prepare('SELECT * FROM students').all();
    }
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
