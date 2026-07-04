const express = require('express');
const router = express.Router();
const prisma = require('../db');

router.get('/', async (req, res) => {
  try {
    let courses = await prisma.courses.findMany();
    // Assign default schedule if missing on seeded courses
    const defaultDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
    const defaultTimes = [
      { start: '09:00', end: '11:50', room: 'Amfi 101' },
      { start: '13:00', end: '15:50', room: 'B-204' },
      { start: '10:00', end: '12:50', room: 'Lab 3' }
    ];
    courses = await Promise.all(courses.map(async (c, i) => {
      if (!c.day_of_week) {
        const time = defaultTimes[i % defaultTimes.length];
        const updated = await prisma.courses.update({
          where: { id: c.id },
          data: {
            day_of_week: defaultDays[i % defaultDays.length],
            start_time: time.start,
            end_time: time.end,
            room: time.room
          }
        });
        return updated;
      }
      return c;
    }));
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