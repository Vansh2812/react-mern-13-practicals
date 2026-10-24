import { useEffect, useState } from 'react'
const API = 'http://localhost:3000'
export default function App() {
  const [mode, setMode] = useState('login')
  const [account, setAccount] = useState({ name: '', email: '', password: '' })
  const [token, setToken] = useState('')
  const [user, setUser] = useState(null)
  const [docs, setDocs] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  async function request(url, options = {}) {
    const headers = { ...(options.headers || {}) }
    if (token) headers.Authorization = `Bearer ${token}`
    const response = await fetch(API + url, { ...options, headers })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Request failed')
    return data
  }
  async function accountSubmit(e) {
    e.preventDefault()
    try {
      if (mode === 'register') {
        await request('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(account) })
        setMode('login')
        setMessage('Account created. Please log in.')
      } else {
        const data = await request('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(account) })
        setToken(data.token)
        setUser(data.user)
        setMessage('Login successful.')
      }
    } catch (e) { setMessage(e.message) }
  }
  async function loadDocs() {
    try { setDocs(await request('/api/documents')) } catch (e) { setMessage(e.message) }
  }
  useEffect(() => { if (token) loadDocs() }, [token])
  async function uploadDoc(e) {
    e.preventDefault()
    if (!file) { setMessage('Choose a file first.'); return }
    const data = new FormData()
    data.append('title', title)
    data.append('description', description)
    data.append('file', file)
    try {
      await request('/api/documents', { method: 'POST', body: data })
      setTitle('')
      setDescription('')
      setFile(null)
      e.target.reset()
      setMessage('Document uploaded.')
      loadDocs()
    } catch (e) { setMessage(e.message) }
  }
  async function deleteDoc(id) {
    try { await request(`/api/documents/${id}`, { method: 'DELETE' }); setMessage('Document deleted.'); loadDocs() }
    catch (e) { setMessage(e.message) }
  }
  function logout() { setToken(''); setUser(null); setDocs([]); setMessage('You have logged out.') }
  return <main><h1>Document Management System</h1><p>Upload, list and manage your documents securely.</p>{!token ? <section className="panel"><h2>{mode === 'login' ? 'Login' : 'Create Account'}</h2><form onSubmit={accountSubmit}>{mode === 'register' && <input required placeholder="Full name" value={account.name} onChange={e => setAccount({ ...account, name: e.target.value })} />}<input required type="email" placeholder="Email" value={account.email} onChange={e => setAccount({ ...account, email: e.target.value })} /><input required type="password" minLength="6" placeholder="Password (minimum 6 characters)" value={account.password} onChange={e => setAccount({ ...account, password: e.target.value })} /><button>{mode === 'login' ? 'Login' : 'Register'}</button></form><button className="light" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Create account' : 'Back to login'}</button></section> : <><section className="panel"><div className="top"><h2>Welcome, {user?.name}</h2><button onClick={logout}>Logout</button></div><h3>Upload Document</h3><form onSubmit={uploadDoc}><input required placeholder="Document title" value={title} onChange={e => setTitle(e.target.value)} /><textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} /><input required type="file" onChange={e => setFile(e.target.files[0])} /><button>Upload</button></form></section><section className="panel"><h2>My Documents ({docs.length})</h2>{docs.length === 0 ? <p>No documents uploaded yet.</p> : docs.map(d => <article className="document" key={d._id}><div><strong>{d.title}</strong><p>{d.originalName} · {Math.ceil(d.size / 1024)} KB</p><small>{d.description}</small><p><a href={`${API}/uploads/${d.storedName}`} target="_blank" rel="noreferrer">Open file</a></p></div><button onClick={() => deleteDoc(d._id)}>Delete</button></article>)}</section></>}{message && <p className="message">{message}</p>}</main>
}
