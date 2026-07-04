const express = require('express');
const router = express.Router();
const prisma = require('../db');

// Get all advisors
router.get('/', async (req, res) => {
  try {
    const advisors = await prisma.advisors.findMany();
    res.json(advisors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get advisor by student id or get default advisor
router.get('/my-advisor/:studentId', async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    let student = await prisma.students.findUnique({
      where: { id: studentId },
      include: { advisors: true }
    });

    if (!student) return res.status(404).json({ error: 'Student not found' });

    // If student doesn't have an advisor assigned, assign or return the first advisor
    if (!student.advisor_id) {
      let firstAdvisor = await prisma.advisors.findFirst();
      if (!firstAdvisor) {
        firstAdvisor = await prisma.advisors.create({
          data: {
            first_name: 'Ahmet',
            last_name: 'Yılmaz',
            title: 'Doç. Dr.',
            email: 'ahmet.yilmaz@university.edu.tr',
            office: 'Mühendislik Fakültesi B-204',
            office_hours: 'Pazartesi & Çarşamba 14:00 - 16:00'
          }
        });
      }
      student = await prisma.students.update({
        where: { id: studentId },
        data: { advisor_id: firstAdvisor.id },
        include: { advisors: true }
      });
    }

    res.json(student.advisors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get appointments for student
router.get('/appointments/:studentId', async (req, res) => {
  try {
    const appointments = await prisma.appointments.findMany({
      where: { student_id: parseInt(req.params.studentId) },
      include: { advisors: true },
      orderBy: { appointment_date: 'desc' }
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Book an appointment
router.post('/appointments', async (req, res) => {
  try {
    const { student_id, advisor_id, appointment_date, notes } = req.body;
    const appointment = await prisma.appointments.create({
      data: {
        student_id: parseInt(student_id),
        advisor_id: parseInt(advisor_id),
        appointment_date: appointment_date ? new Date(appointment_date) : new Date(),
        notes,
        status: 'approved'
      },
      include: { advisors: true }
    });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages between student and advisor
router.get('/messages/:studentId', async (req, res) => {
  try {
    const messages = await prisma.messages.findMany({
      where: { student_id: parseInt(req.params.studentId) },
      orderBy: { created_at: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/messages', async (req, res) => {
  try {
    const { student_id, advisor_id, content, sender_type } = req.body;
    const message = await prisma.messages.create({
      data: {
        student_id: parseInt(student_id),
        advisor_id: parseInt(advisor_id),
        content,
        sender_type: sender_type || 'student'
      }
    });

    // Auto reply simulator from advisor if sent by student
    if (sender_type === 'student') {
      setTimeout(async () => {
        try {
          await prisma.messages.create({
            data: {
              student_id: parseInt(student_id),
              advisor_id: parseInt(advisor_id),
              content: 'Mesajınız ulaştı. Ofis saatlerimde veya randevumuzda detaylı görüşelim.',
              sender_type: 'advisor'
            }
          });
        } catch (e) {}
      }, 1500);
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
