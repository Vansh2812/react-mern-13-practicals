import { useEffect, useState } from "react";
export default function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", course: "" });
  const [message, setMessage] = useState("Loading students...");
  async function load() {
    try {
      const r = await fetch("http://localhost:3000/api/students");
      if (!r.ok) throw new Error("Could not load students");
      setStudents(await r.json());
      setMessage("");
    } catch {
      setMessage("Start the backend and configure MongoDB to load students.");
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function submit(e) {
    e.preventDefault();
    try {
      const r = await fetch("http://localhost:3000/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Could not add student");
      setForm({ name: "", email: "", course: "" });
      setMessage("Student added successfully.");
      load();
    } catch (e) {
      setMessage(e.message);
    }
  }
  async function remove(id) {
    try {
      const r = await fetch(`http://localhost:3000/api/students/${id}`, {
        method: "DELETE",
      });
      if (!r.ok) throw new Error("Could not delete student");
      load();
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <main>
      <h1>MERN Student Manager</h1>
      <form onSubmit={submit}>
        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          required
          placeholder="Course"
          value={form.course}
          onChange={(e) => setForm({ ...form, course: e.target.value })}
        />
        <button>Add Student</button>
      </form>
      {message && <p>{message}</p>}
      <h2>Student Records</h2>
      {students.map((s) => (
        <section className="card" key={s._id}>
          <strong>{s.name}</strong>
          <p>
            {s.email} · {s.course}
          </p>
          <button onClick={() => remove(s._id)}>Delete</button>
        </section>
      ))}
    </main>
  );
}
