// src/seed.js
const fs = require('fs');
const { init, db } = require('./db');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Initialize schema
init();

// Helper to run safely
function run(sql, params = []) {
  return db.prepare(sql).run(...params);
}

function insertIfNotExists(table, id, fields = {}) {
  // check
  const exists = db.prepare(`SELECT 1 FROM ${table} WHERE id = ?`).get(id);
  if (exists) return;
  const keys = Object.keys(fields).join(', ');
  const placeholders = Object.keys(fields).map(() => '?').join(', ');
  const stmt = db.prepare(`INSERT INTO ${table} (id, ${keys}) VALUES (?, ${placeholders})`);
  stmt.run(id, ...Object.values(fields));
}

function seed() {
  console.log('Seeding sample data...');

  // Colleges
  const collegeA = 'college_alpha';
  insertIfNotExists('colleges', collegeA, { name: 'Alpha Institute of Tech' });

  // Students (10)
  const students = [];
  for (let i = 1; i <= 10; i++) {
    const sid = `${collegeA}::s${String(i).padStart(3, '0')}`;
    students.push({ id: sid, name: `Student ${i}`, email: `s${i}@alpha.edu` });
    insertIfNotExists('students', sid, { college_id: collegeA, name: `Student ${i}`, email: `s${i}@alpha.edu` });
  }

  // Events (5)
  const eventIds = [];
  const types = ['Workshop', 'Seminar', 'Fest', 'Workshop', 'Tech Talk'];
  for (let i = 1; i <= 5; i++) {
    const eid = `${collegeA}::${uuidv4()}`;
    eventIds.push(eid);
    insertIfNotExists('events', eid, {
      college_id: collegeA,
      name: `Event ${i}`,
      type: types[i - 1],
      date: (new Date(Date.now() + i * 24 * 3600 * 1000)).toISOString().slice(0, 10),
      capacity: 100
    });
  }

  // Registrations: first event: all 10, others: subset
  eventIds.forEach((eid, idx) => {
    const regs = (idx === 0) ? students : students.filter((_, i) => (i % (idx + 2) === 0));
    regs.forEach(s => {
      try {
        run('INSERT INTO registrations (event_id, student_id) VALUES (?, ?)', [eid, s.id]);
      } catch (e) {
        // ignore unique errors
      }
    });
  });

  // Attendance: mark attendance for some students
  // For event 0, students 1..8 attended; for others a few
  eventIds.forEach((eid, idx) => {
    students.forEach((s, si) => {
      const attendChance = ((si + idx) % 3 === 0); // rough pattern
      if (attendChance) {
        try {
          run('INSERT INTO attendance (event_id, student_id) VALUES (?, ?)', [eid, s.id]);
        } catch (e) {}
      }
    });
  });

  // Feedback: some students give feedback (1-5)
  eventIds.forEach((eid, idx) => {
    students.forEach((s, si) => {
      const giveFeedback = ((si + idx) % 4 === 0);
      if (giveFeedback) {
        const rating = 3 + ((si + idx) % 3); // 3..5
        try {
          run('INSERT INTO feedback (event_id, student_id, rating, comment) VALUES (?, ?, ?, ?)', [eid, s.id, rating, `Feedback ${rating}`]);
        } catch (e) {}
      }
    });
  });

  console.log('Seed complete. Sample events:', eventIds);
  console.log('DB file path:', path.join(__dirname, '..', 'data', 'campus.db'));
}

seed();
