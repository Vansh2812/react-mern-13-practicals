import { useState } from 'react'
export default function App() {
  const [form, setForm] = useState({ name: '', email: '', course: '' })
  const [students, setStudents] = useState([])
  const [error, setError] = useState('')
  function update(e) { setForm({ ...form, [e.target.name]: e.target.value }) }
  function submit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.course) { setError('Please complete every field.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Enter a valid email address.'); return }
    setStudents([...students, { ...form, id: Date.now() }])
    setForm({ name: '', email: '', course: '' })
    setError('')
  }
  return <main><h1>Student Management Form</h1><form onSubmit={submit}><div><input name="name" value={form.name} onChange={update} placeholder="Student name" /></div><div><input name="email" value={form.email} onChange={update} placeholder="Email address" /></div><div><select name="course" value={form.course} onChange={update}><option value="">Select course</option><option>BCA</option><option>BSc IT</option><option>MCA</option></select></div><button type="submit">Add Student</button></form>{error && <p className="error">{error}</p>}<h2>Students ({students.length})</h2>{students.length === 0 ? <p>No students added yet.</p> : <ul>{students.map(s => <li key={s.id}>{s.name} — {s.email} — {s.course} <button onClick={() => setStudents(students.filter(x => x.id !== s.id))}>Delete</button></li>)}</ul>}</main>
}
