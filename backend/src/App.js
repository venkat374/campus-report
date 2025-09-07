// src/app.js
const express = require('express');
const { init } = require('./db');

const eventsRoute = require('./routes/events');
const studentsRoute = require('./routes/students');
const registrationsRoute = require('./routes/registrations');
const attendanceRoute = require('./routes/attendance');
const feedbackRoute = require('./routes/feedback');
const reportsRoute = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize DB schema
init();

// routes
app.use('/events', eventsRoute);
app.use('/students', studentsRoute);
app.use('/registrations', registrationsRoute); // alternate route
app.use('/attendance', attendanceRoute);
app.use('/feedback', feedbackRoute);
app.use('/reports', reportsRoute);

// root
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Campus reporting prototype API is running.' });
});

// error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

module.exports = app;
