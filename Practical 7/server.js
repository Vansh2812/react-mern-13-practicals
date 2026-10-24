
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Connect MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Employee Schema
const employeeSchema = new mongoose.Schema({
  name: String,
  position: String,
  salary: Number
});

const Employee = mongoose.model('Employee', employeeSchema);

app.get('/', (req, res) => {
  res.send('Welcome to the Employee API');
});

// CREATE Employee
app.post('/employees', async (req, res) => {
  const employee = await Employee.create(req.body);
  res.json(employee);
});

// READ All Employees
app.get('/employees', async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
});

// READ One Employee
app.get('/employees/:id', async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee)
    return res.status(404).json({ message: 'Employee not found' });

  res.json(employee);
});

// UPDATE Employee
app.put('/employees/:id', async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!employee)
    return res.status(404).json({ message: 'Employee not found' });

  res.json(employee);
});

// DELETE Employee
app.delete('/employees/:id', async (req, res) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);

  if (!employee)
    return res.status(404).json({ message: 'Employee not found' });

  res.json({ message: 'Employee deleted successfully' });
});

// Start Server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
