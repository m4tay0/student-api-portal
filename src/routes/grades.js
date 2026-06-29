const express = require('express');
const router = express.Router();
const prisma = require('../db');

router.get('/', async (req, res) => {
  try {
    const grades = await prisma.grades.findMany({
      include: { students: true, courses: true },
    });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const grades = await prisma.grades.findMany({
      where: { student_id: parseInt(req.params.studentId) },
      include: { courses: true },
    });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const grade = await prisma.grades.create({ data: req.body });
    res.status(201).json(grade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;