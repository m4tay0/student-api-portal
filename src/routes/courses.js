const express = require('express');
const router = express.Router();
const prisma = require('../db');

router.get('/', async (req, res) => {
  try {
    const courses = await prisma.courses.findMany();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await prisma.courses.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        assignments: true,
        announcements: true,
      },
    });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const course = await prisma.courses.create({ data: req.body });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;