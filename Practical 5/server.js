
import express from "express";

const app = express();

app.use(express.json());

let students = [
  { id: 1, name: "Vansh" },
  { id: 2, name: "Ravi" }
];

app.get("/", (req, res) => {
  res.send("Welcome to the Student API");
});

// READ - Get all students
app.get("/students", (req, res) => {
  res.json(students);
});

// CREATE - Add student
app.post("/students", (req, res) => {
  students.push(req.body);
  res.send("Student Added Successfully");
});

// UPDATE - Update student
app.put("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const student = students.find(s => s.id === id);

  if (student) {
    student.name = req.body.name;
    res.send("Student Updated Successfully");
  } else {
    res.status(404).send("Student Not Found");
  }
});

// DELETE - Delete student
app.delete("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const exists = students.some(s => s.id === id);

  if (!exists) {
    return res.status(404).send("Student Not Found");
  }

  students = students.filter(s => s.id !== id);
  res.send("Student Deleted Successfully");
});

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
