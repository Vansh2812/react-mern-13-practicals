import React, { useState } from "react";

function Student(props) {
  const [count, setCount] = useState(0);

  function increase() {
    setCount(count + 1);
  }

  return (
    <div className="card" style={{ border: "1px solid #ccc", padding: "20px", margin: "20px" }}>
      <h2>Student Name: {props.name}</h2>

      <h3>Count: {count}</h3>

      <button onClick={increase}>
        Click Me
      </button>
    </div>
  );
}

function App() {
  return (
    <div>
      <h1>React Application</h1>
      <Student name="Rahul" />
    </div>
  );
}

export default App;