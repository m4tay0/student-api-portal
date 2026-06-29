const express = require('express');
const router = express.Router();
const prisma = require('../db');
// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await prisma.students.findMany();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student by id
router.get('/:id', async (req, res) => {
  try {
    const student = await prisma.students.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        grades: { include: { courses: true } },
        submissions: true,
      },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create student
router.post('/', async (req, res) => {
  try {
    const student = await prisma.students.create({ data: req.body });
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;