// src/App.js
import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from './api';

function useFetchEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const reload = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/events');
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setEvents([]);
    } finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);
  return { events, loading, reload, setEvents };
}

function useFetchStudents() {
  const [students, setStudents] = useState([]);
  const reload = async () => {
    try {
      const data = await apiGet('/students');
      setStudents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setStudents([]);
    }
  };
  useEffect(() => { reload(); }, []);
  return { students, reload, setStudents };
}

function Notification({ msg }) {
  if (!msg) return null;
  return <div className={`msg ${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>;
}

function CreateEvent({ onCreated }) {
  const [college_id, setCollegeId] = useState('college_alpha');
  const [name, setName] = useState('');
  const [type, setType] = useState('Workshop');
  const [date, setDate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [msg, setMsg] = useState(null);
  const creating = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const payload = { college_id, name, type, date: date || null, capacity: capacity ? Number(capacity) : null };
      const created = await apiPost('/events', payload);
      setMsg({ type:'success', text:'Event created.' });
      setName(''); setDate(''); setCapacity('');
      onCreated && onCreated(created);
    } catch (err) {
      console.error(err);
      setMsg({ type:'error', text: err.message });
    }
  };
  return (
    <div className="panel">
      <h3>Create Event</h3>
      <Notification msg={msg} />
      <form onSubmit={creating}>
        <div className="form-row">
          <input placeholder="College ID (e.g. college_alpha)" value={college_id} onChange={e=>setCollegeId(e.target.value)} />
          <input placeholder="Event name" value={name} onChange={e=>setName(e.target.value)} required />
        </div>
        <div className="form-row">
          <select value={type} onChange={e=>setType(e.target.value)}>
            <option>Workshop</option>
            <option>Seminar</option>
            <option>Fest</option>
            <option>Tech Talk</option>
          </select>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        </div>
        <div className="form-row">
          <input placeholder="Capacity (optional)" value={capacity} onChange={e=>setCapacity(e.target.value)} />
          <button className="button" type="submit">Create</button>
        </div>
      </form>
    </div>
  );
}

function CreateStudent({ onCreated }) {
  const [college_id, setCollegeId] = useState('college_alpha');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault(); setMsg(null);
    try {
      const created = await apiPost('/students', { college_id, name, email: email || null });
      setMsg({ type:'success', text:'Student created.' });
      setName(''); setEmail('');
      onCreated && onCreated(created);
    } catch (err) {
      console.error(err);
      setMsg({ type:'error', text: err.message });
    }
  };
  return (
    <div className="panel">
      <h3>Create Student</h3>
      <Notification msg={msg} />
      <form onSubmit={submit}>
        <div className="form-row">
          <input placeholder="College ID" value={college_id} onChange={e=>setCollegeId(e.target.value)} />
          <input placeholder="Student name" value={name} onChange={e=>setName(e.target.value)} required />
        </div>
        <div className="form-row">
          <input placeholder="Email (optional)" value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="button" type="submit">Create</button>
        </div>
      </form>
    </div>
  );
}

function EventCard({ ev, students, onRegisterSuccess, onAttendanceSuccess, onFeedbackSuccess }) {
  const [msg, setMsg] = useState(null);
  const [showReg, setShowReg] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [showAttend, setShowAttend] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const register = async () => {
    setMsg(null);
    if (!selectedStudent) { setMsg({type:'error', text:'Choose a student to register.'}); return; }
    try {
      await apiPost('/registrations', { event_id: ev.id, student_id: selectedStudent });
      setMsg({type:'success', text:'Registered successfully.'});
      onRegisterSuccess && onRegisterSuccess();
      setShowReg(false);
    } catch (err) {
      setMsg({type:'error', text:err.message});
    }
  };

  const markAttendance = async () => {
    setMsg(null);
    if (!selectedStudent) { setMsg({type:'error', text:'Choose a student to mark attendance.'}); return; }
    try {
      await apiPost('/attendance', { event_id: ev.id, student_id: selectedStudent });
      setMsg({type:'success', text:'Attendance marked.'});
      onAttendanceSuccess && onAttendanceSuccess();
      setShowAttend(false);
    } catch (err) {
      setMsg({type:'error', text:err.message});
    }
  };

  const submitFeedback = async () => {
    setMsg(null);
    if (!selectedStudent) { setMsg({type:'error', text:'Choose a student.'}); return; }
    try {
      await apiPost('/feedback', { event_id: ev.id, student_id: selectedStudent, rating: Number(rating), comment: comment || null });
      setMsg({type:'success', text:'Feedback submitted.'});
      onFeedbackSuccess && onFeedbackSuccess();
      setShowFeedback(false);
      setRating(5); setComment('');
    } catch (err) {
      setMsg({type:'error', text:err.message});
    }
  };

  const dateDisplay = ev.date ? new Date(ev.date).toLocaleDateString() : 'TBD';

  return (
    <div className="panel">
      <Notification msg={msg} />
      <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
        <div>
          <div style={{fontWeight:700}}>{ev.name}</div>
          <div className="small-muted">{ev.type} • {dateDisplay}</div>
        </div>
        <div className="inline">
          <button className="button" onClick={() => setShowReg(s => !s)}>Register</button>
          <button className="button secondary" onClick={() => setShowAttend(s => !s)}>Mark Attendance</button>
          <button className="button" onClick={() => setShowFeedback(s => !s)}>Feedback</button>
        </div>
      </div>

      {(showReg || showAttend || showFeedback) && (
        <div style={{marginTop:12}}>
          <div className="form-row">
            <select value={selectedStudent} onChange={e=>setSelectedStudent(e.target.value)}>
              <option value="">-- select student --</option>
              {students.map(s => (<option key={s.id} value={s.id}>{s.name} ({s.id})</option>))}
            </select>
            {showReg && <button className="button" type="button" onClick={register}>Confirm Register</button>}
            {showAttend && <button className="button" type="button" onClick={markAttendance}>Mark</button>}
            {showFeedback && (
              <>
                <select value={rating} onChange={e=>setRating(e.target.value)}>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
                <input placeholder="Comment (optional)" value={comment} onChange={e=>setComment(e.target.value)} />
                <button className="button" onClick={submitFeedback}>Submit</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsPanel() {
  const [pop, setPop] = useState([]);
  const [att, setAtt] = useState([]);
  const [avgFb, setAvgFb] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [studentReport, setStudentReport] = useState(null);
  const [eventId, setEventId] = useState('');
  const [eventReport, setEventReport] = useState(null);
  const [msg, setMsg] = useState(null);

  const loadAll = async () => {
    try {
      const [p, a, f, t] = await Promise.all([
        apiGet('/reports/popularity'),
        apiGet('/reports/attendance-percent'),
        apiGet('/reports/avg-feedback'),
        apiGet('/reports/top-active?limit=5')
      ]);
      setPop(p); setAtt(a); setAvgFb(f); setTopStudents(t);
    } catch (e) {
      console.error(e);
      setMsg({type:'error', text: e.message});
    }
  };

  useEffect(() => { loadAll(); }, []);

  const loadStudent = async () => {
    setStudentReport(null); setMsg(null);
    if (!studentId) { setMsg({type:'error', text:'Provide student ID'}); return; }
    try {
      const r = await apiGet(`/reports/student/${encodeURIComponent(studentId)}`);
      setStudentReport(r);
    } catch (e) {
      setMsg({type:'error', text:e.message});
    }
  };

  const loadEvent = async () => {
    setEventReport(null); setMsg(null);
    if (!eventId) { setMsg({type:'error', text:'Provide event ID'}); return; }
    try {
      const r = await apiGet(`/reports/event/${encodeURIComponent(eventId)}`);
      setEventReport(r);
    } catch (e) {
      setMsg({type:'error', text:e.message});
    }
  };

  return (
    <div className="panel">
      <h3>Reports</h3>
      <Notification msg={msg} />

      <div style={{marginBottom:12}}>
        <strong>Event Popularity</strong>
        <table className="table">
          <thead><tr><th>Event</th><th>Type</th><th>Registrations</th></tr></thead>
          <tbody>
            {pop.map(r => <tr key={r.event_id}><td>{r.event_name}</td><td>{r.type}</td><td>{r.registrations}</td></tr>)}
          </tbody>
        </table>
      </div>

      <div style={{marginBottom:12}}>
        <strong>Attendance %</strong>
        <table className="table">
          <thead><tr><th>Event</th><th>Registered</th><th>Attended</th><th>%</th></tr></thead>
          <tbody>
            {att.map(r => <tr key={r.event_id}><td>{r.name}</td><td>{r.registered}</td><td>{r.attended}</td><td>{r.attendance_percent}</td></tr>)}
          </tbody>
        </table>
      </div>

      <div style={{marginBottom:12}}>
        <strong>Avg Feedback</strong>
        <table className="table">
          <thead><tr><th>Event</th><th>Avg Rating</th><th>Feedback Count</th></tr></thead>
          <tbody>
            {avgFb.map(r => <tr key={r.event_id}><td>{r.name}</td><td>{r.avg_rating ?? 'N/A'}</td><td>{r.feedback_count}</td></tr>)}
          </tbody>
        </table>
      </div>

      <div style={{marginBottom:12}}>
        <strong>Top Active Students</strong>
        <table className="table">
          <thead><tr><th>Student</th><th>Events Attended</th></tr></thead>
          <tbody>
            {topStudents.map(r => <tr key={r.student_id}><td>{r.name}</td><td>{r.events_attended}</td></tr>)}
          </tbody>
        </table>
      </div>

      <div style={{marginTop:12}}>
        <div className="form-row">
          <input placeholder="Student ID (e.g. college_alpha::s001)" value={studentId} onChange={e=>setStudentId(e.target.value)} />
          <button className="button" onClick={loadStudent}>Load Student Report</button>
        </div>
        {studentReport && (
          <div style={{marginTop:8}}>
            <div><strong>{studentReport.name}</strong></div>
            <div className="small-muted">Events attended: {studentReport.events_attended}</div>
          </div>
        )}

        <div style={{marginTop:12}} className="form-row">
          <input placeholder="Event ID (e.g. college_alpha::...)" value={eventId} onChange={e=>setEventId(e.target.value)} />
          <button className="button" onClick={loadEvent}>Load Event Report</button>
        </div>
        {eventReport && (
          <div style={{marginTop:8}}>
            <div><strong>{eventReport.name}</strong></div>
            <div className="small-muted">Registered: {eventReport.registered} • Attended: {eventReport.attended} • Attendance %: {eventReport.attendance_percent}</div>
            <div className="small-muted">Average Rating: {eventReport.avg_rating ?? 'N/A'} ({eventReport.feedback_count} feedbacks)</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const tabs = ['Events','Create','Students','Reports'];
  const [active, setActive] = useState('Events');
  const { events, loading, reload, setEvents } = useFetchEvents();
  const { students, reload: reloadStudents, setStudents } = useFetchStudents();
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    if (!notif) return;
    const t = setTimeout(()=>setNotif(null), 4000);
    return () => clearTimeout(t);
  }, [notif]);

  return (
    <div className="container">
      <div className="header">
        <h1>Campus Events Dashboard</h1>
        <div className="nav">
          {tabs.map(t => (<button key={t} className={`button ${active===t ? '' : 'secondary'}`} onClick={()=>setActive(t)}>{t}</button>))}
        </div>
      </div>

      <Notification msg={notif} />

      {active === 'Events' && (
        <>
          <div style={{marginBottom:12}} className="panel">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <strong>Events</strong>
                <div className="small-muted">List of events from the backend</div>
              </div>
              <div className="inline">
                <button className="button" onClick={()=>{ reload(); reloadStudents(); setNotif({type:'success', text:'Refreshed'}); }}>Refresh</button>
              </div>
            </div>
          </div>

          {loading ? <div className="panel">Loading events...</div> :
            events.length === 0 ? <div className="panel">No events found.</div> :
            <div className="list">
              {events.map(ev => (
                <EventCard key={ev.id} ev={ev} students={students} onRegisterSuccess={() => { reload(); setNotif({type:'success', text:'Registered'}); }} onAttendanceSuccess={() => { reload(); setNotif({type:'success', text:'Attendance marked'}); }} onFeedbackSuccess={() => { reload(); setNotif({type:'success', text:'Feedback saved'}); }} />
              ))}
            </div>
          }
        </>
      )}

      {active === 'Create' && (
        <>
          <CreateEvent onCreated={() => { reload(); setNotif({type:'success', text:'Event created'}); }} />
          <div className="panel">
            <h3>Quick actions</h3>
            <div className="form-row">
              <button className="button" onClick={() => { apiPost('/events', { college_id:'college_alpha', name:'Quick Event', type:'Workshop', date:null, capacity:50 }).then(()=>{ reload(); setNotif({type:'success', text:'Quick event created'}); }).catch(e=>setNotif({type:'error', text:e.message})); }}>Create Quick Event</button>
              <button className="button secondary" onClick={() => { apiPost('/students', { college_id:'college_alpha', name:`Student ${Math.floor(Math.random()*1000)}`, email:null }).then(()=>{ reloadStudents(); setNotif({type:'success', text:'Student created'}); }).catch(e=>setNotif({type:'error', text:e.message})); }}>Create Quick Student</button>
            </div>
          </div>
        </>
      )}

      {active === 'Students' && (
        <>
          <CreateStudent onCreated={() => { reloadStudents(); setNotif({type:'success', text:'Student created'}); }} />
          <div className="panel">
            <h3>Students</h3>
            <div className="small-muted">List of students</div>
            <table className="table" style={{marginTop:8}}>
              <thead><tr><th>ID</th><th>Name</th><th>Email</th></tr></thead>
              <tbody>
                {students.map(s => (<tr key={s.id}><td><code>{s.id}</code></td><td>{s.name}</td><td>{s.email || '-'}</td></tr>))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {active === 'Reports' && <ReportsPanel />}

    </div>
  );
}
