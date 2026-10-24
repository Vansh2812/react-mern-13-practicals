import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
const socket = io('http://localhost:3000', { autoConnect: false })
export default function App() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [connected, setConnected] = useState(false)
  useEffect(() => {
    socket.connect()
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('chat-history', setMessages)
    socket.on('chat-message', item => setMessages(old => [...old, item].slice(-50)))
    return () => { socket.off('connect'); socket.off('disconnect'); socket.off('chat-history'); socket.off('chat-message'); socket.disconnect() }
  }, [])
  function send(e) {
    e.preventDefault()
    if (!message.trim()) return
    socket.emit('chat-message', { name: name.trim() || 'Guest', message: message.trim() })
    setMessage('')
  }
  return <main><h1>Real-Time Chat</h1><p>Server: {connected ? 'Connected' : 'Disconnected'}</p><label>Your name <input value={name} onChange={e => setName(e.target.value)} placeholder="Guest" /></label><section className="messages">{messages.map(m => <article key={m.id}><strong>{m.name}</strong> <small>{m.time}</small><p>{m.message}</p></article>)}</section><form onSubmit={send}><input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message" maxLength="500" /><button disabled={!connected}>Send</button></form></main>
}
