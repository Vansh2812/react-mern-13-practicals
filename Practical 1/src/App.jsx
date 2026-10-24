function WelcomeCard({ name, role }) {
  return <section className="card"><h2>Hello, {name}!</h2><p>{role}</p></section>
}
function Feature({ title, detail }) {
  return <section className="card"><h3>{title}</h3><p>{detail}</p></section>
}
export default function App() {
  return <main><h1>Reusable React Components</h1><p>This page uses functional components and JSX.</p><WelcomeCard name="Vansh" role="React Student" /><WelcomeCard name="Aryan" role="Frontend Learner" /><Feature title="Functional Components" detail="Build UI with JavaScript functions." /><Feature title="Reusability" detail="Use the same component with different props." /></main>
}
