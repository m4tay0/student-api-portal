const express = require('express');
const router = express.Router();
const prisma = require('../db');

router.get('/', async (req, res) => {
  try {
    const submissions = await prisma.submissions.findMany({
      include: { students: true, assignments: true },
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const submissions = await prisma.submissions.findMany({
      where: { student_id: parseInt(req.params.studentId) },
      include: { assignments: true },
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const submission = await prisma.submissions.create({ data: req.body });
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;