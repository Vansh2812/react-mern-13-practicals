
import express from 'express';

const app = express();
app.use(express.json());

let students = [
  { id: 1, name: 'Rahul', age: 20 },
  { id: 2, name: 'Amit', age: 21 }
];

app.get('/', (req, res) => {
  res.send('Welcome to the Student API');
});

// GET - View all students
app.get('/students', (req, res) => {
  res.json(students);
});

// GET - View one student
app.get('/students/:id', (req, res) => {
  const student = students.find(s => s.id == req.params.id);
  res.json(student || { message: 'Student not found' });
});

// POST - Add student
app.post('/students', (req, res) => {
  students.push(req.body);
  res.send('Student Added Successfully');
});

// PUT - Update student
app.put('/students/:id', (req, res) => {
  const student = students.find(s => s.id == req.params.id);

  if (student) {
    student.name = req.body.name;
    student.age = req.body.age;
    res.send('Student Updated Successfully');
  } else {
    res.send('Student Not Found');
  }
});

// DELETE - Delete student
app.delete('/students/:id', (req, res) => {
  students = students.filter(s => s.id != req.params.id);
  res.send('Student Deleted Successfully');
});

// Start server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
