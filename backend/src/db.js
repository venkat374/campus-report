// src/db.js
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'campus.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);

function init() {
  const schema = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS colleges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    FOREIGN KEY (college_id) REFERENCES colleges(id)
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    date TEXT,
    capacity INTEGER,
    cancelled INTEGER DEFAULT 0,
    FOREIGN KEY (college_id) REFERENCES colleges(id)
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    registered_at TEXT DEFAULT (datetime('now')),
    UNIQUE(event_id, student_id),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    checked_in_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    submitted_at TEXT DEFAULT (datetime('now')),
    UNIQUE(event_id, student_id),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE INDEX IF NOT EXISTS idx_reg_event ON registrations(event_id);
  CREATE INDEX IF NOT EXISTS idx_att_event ON attendance(event_id);
  CREATE INDEX IF NOT EXISTS idx_fb_event ON feedback(event_id);
  CREATE INDEX IF NOT EXISTS idx_student_college ON students(college_id);
  `;

  db.exec(schema);
  console.log('DB initialized (schema created if not exists).');
}

module.exports = { db, init };
