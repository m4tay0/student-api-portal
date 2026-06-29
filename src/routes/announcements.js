const express = require('express');
const router = express.Router();
const prisma = require('../db');

router.get('/', async (req, res) => {
  try {
    const announcements = await prisma.announcements.findMany({
      include: { courses: true },
      orderBy: { created_at: 'desc' },
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const announcement = await prisma.announcements.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { courses: true },
    });
    if (!announcement) return res.status(404).json({ error: 'Announcement not found' });
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const announcement = await prisma.announcements.create({ data: req.body });
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;