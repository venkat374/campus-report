// src/routes/reports.js
const express = require('express');
const router = express.Router();
const { db } = require('../db');

/**
 * GET /reports/popularity
 * returns registrations per event (sorted desc)
 */
router.get('/popularity', (req, res, next) => {
  try {
    const rows = db.prepare(`
      SELECT e.id AS event_id, e.name AS event_name, e.type,
             COUNT(r.id) AS registrations
      FROM events e
      LEFT JOIN registrations r ON r.event_id = e.id
      WHERE e.cancelled = 0
      GROUP BY e.id
      ORDER BY registrations DESC
    `).all();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /reports/event/:id
 * returns registration count, attendance percent, avg feedback for specific event
 */
router.get('/event/:id', (req, res, next) => {
  try {
    const eventId = req.params.id;
    const row = db.prepare(`
      SELECT e.id AS event_id, e.name,
             COUNT(DISTINCT r.student_id) AS registered,
             COUNT(DISTINCT a.student_id) AS attended,
             CASE WHEN COUNT(DISTINCT r.student_id)=0 THEN 0
                  ELSE ROUND(100.0 * COUNT(DISTINCT a.student_id) / COUNT(DISTINCT r.student_id), 2) END AS attendance_percent,
             ROUND(AVG(f.rating), 2) AS avg_rating,
             COUNT(f.id) AS feedback_count
      FROM events e
      LEFT JOIN registrations r ON r.event_id = e.id
      LEFT JOIN attendance a ON a.event_id = e.id
      LEFT JOIN feedback f ON f.event_id = e.id
      WHERE e.id = ?
      GROUP BY e.id
    `).get(eventId);
    if (!row) return res.status(404).json({ error: 'event not found' });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /reports/attendance-percent
 * attendance percentage per event (for all events)
 */
router.get('/attendance-percent', (req, res, next) => {
  try {
    const rows = db.prepare(`
      SELECT e.id AS event_id, e.name,
             COUNT(DISTINCT a.student_id) AS attended,
             COUNT(DISTINCT r.student_id) AS registered,
             CASE WHEN COUNT(DISTINCT r.student_id)=0 THEN 0
                  ELSE ROUND(100.0 * COUNT(DISTINCT a.student_id) / COUNT(DISTINCT r.student_id), 2) END AS attendance_percent
      FROM events e
      LEFT JOIN registrations r ON r.event_id = e.id
      LEFT JOIN attendance a ON a.event_id = e.id
      WHERE e.cancelled = 0
      GROUP BY e.id
      ORDER BY attendance_percent DESC
    `).all();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /reports/avg-feedback
 */
router.get('/avg-feedback', (req, res, next) => {
  try {
    const rows = db.prepare(`
      SELECT e.id AS event_id, e.name,
             ROUND(AVG(f.rating), 2) AS avg_rating,
             COUNT(f.id) AS feedback_count
      FROM events e
      LEFT JOIN feedback f ON f.event_id = e.id
      WHERE e.cancelled = 0
      GROUP BY e.id
      ORDER BY avg_rating DESC
    `).all();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /reports/student/:studentId
 * student participation report: how many events student attended
 */
router.get('/student/:studentId', (req, res, next) => {
  try {
    const studentId = req.params.studentId;
    const row = db.prepare(`
      SELECT s.id as student_id, s.name,
             COUNT(DISTINCT a.event_id) as events_attended
      FROM students s
      LEFT JOIN attendance a ON a.student_id = s.id
      WHERE s.id = ?
      GROUP BY s.id
    `).get(studentId);
    if (!row) return res.status(404).json({ error: 'student not found' });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /reports/top-active?limit=3
 * top N active students by distinct events attended
 */
router.get('/top-active', (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '3', 10);
    const rows = db.prepare(`
      SELECT s.id AS student_id, s.name,
             COUNT(DISTINCT a.event_id) AS events_attended
      FROM students s
      JOIN attendance a ON a.student_id = s.id
      GROUP BY s.id
      ORDER BY events_attended DESC
      LIMIT ?
    `).all(limit);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
