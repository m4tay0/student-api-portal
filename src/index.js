const express = require('express');
const cors = require('cors');
require('dotenv/config');

const studentsRouter = require('./routes/students');
const coursesRouter = require('./routes/courses');
const gradesRouter = require('./routes/grades');
const assignmentsRouter = require('./routes/assignments');
const announcementsRouter = require('./routes/announcements');
const submissionsRouter = require('./routes/submissions');
const authRouter = require('./routes/auth');

const app = express();

app.use(cors({ origin: '*' })); // Allow requests from any origin
app.use(express.json());
app.use('/api/auth', authRouter);

app.use('/api/students', studentsRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/grades', gradesRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/submissions', submissionsRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Student Portal API is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});