const express = require('express');
const router = express.Router();
const prisma = require('../db');

// Get notifications for student
router.get('/:studentId', async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    let notifications = await prisma.notifications.findMany({
      where: { student_id: studentId },
      orderBy: { created_at: 'desc' }
    });

    // Seed default notifications if empty
    if (notifications.length === 0) {
      await prisma.notifications.createMany({
        data: [
          {
            student_id: studentId,
            title: 'Yeni Not Girildi',
            message: 'Matematik I dersine ait Vize notu açıklandı.',
            type: 'grade',
            is_read: false
          },
          {
            student_id: studentId,
            title: 'Ödev Teslim Hatırlatıcısı',
            message: 'Fizik Lab Raporu teslimine son 24 saat kaldı.',
            type: 'assignment',
            is_read: false
          },
          {
            student_id: studentId,
            title: 'Danışman Duyurusu',
            message: 'Bahar dönemi ders seçim onayları başlamıştır.',
            type: 'advisor',
            is_read: true
          }
        ]
      });
      notifications = await prisma.notifications.findMany({
        where: { student_id: studentId },
        orderBy: { created_at: 'desc' }
      });
    }

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await prisma.notifications.update({
      where: { id: parseInt(req.params.id) },
      data: { is_read: true }
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create notification
router.post('/', async (req, res) => {
  try {
    const { student_id, title, message, type } = req.body;
    const notification = await prisma.notifications.create({
      data: {
        student_id: parseInt(student_id),
        title,
        message,
        type: type || 'general',
        is_read: false
      }
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
