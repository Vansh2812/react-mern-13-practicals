import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
function Home() { return <section className="card"><h2>Home Page</h2><p>Welcome to the React Router single page application.</p></section> }
function About() { return <section className="card"><h2>About Page</h2><p>This page demonstrates client-side navigation.</p></section> }
function Contact() { return <section className="card"><h2>Contact Page</h2><p>Email: student@example.com</p></section> }
export default function App() {
  return <BrowserRouter><main><h1>React Router SPA</h1><nav><Link to="/">Home</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link></nav><Routes><Route path="/" element={<Home />} /><Route path="/about" element={<About />} /><Route path="/contact" element={<Contact />} /><Route path="*" element={<h2>Page not found</h2>} /></Routes></main></BrowserRouter>
}
