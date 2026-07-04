const express = require('express');
const router = express.Router();
const prisma = require('../db');
const crypto = require('crypto');

// Get requested documents for a student
router.get('/my-documents/:studentId', async (req, res) => {
  try {
    const documents = await prisma.document_requests.findMany({
      where: { student_id: parseInt(req.params.studentId) },
      orderBy: { created_at: 'desc' }
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request new document (Student Certificate or Transcript)
router.post('/request', async (req, res) => {
  try {
    const { student_id, document_type } = req.body;
    // Generate unique verification code e.g. UNI-2026-XXXXX
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const verificationCode = `UNI-${new Date().getFullYear()}-${randomHex}`;

    const document = await prisma.document_requests.create({
      data: {
        student_id: parseInt(student_id),
        document_type: document_type || 'Öğrenci Belgesi',
        verification_code: verificationCode,
        status: 'Hazır (E-İmzalı)'
      }
    });
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify document via verification code
router.get('/verify/:code', async (req, res) => {
  try {
    const document = await prisma.document_requests.findUnique({
      where: { verification_code: req.params.code },
      include: { students: true }
    });

    if (!document) {
      return res.status(404).json({ valid: false, message: 'Bu doğrulama koduna ait belge bulunamadı.' });
    }

    res.json({
      valid: true,
      document_type: document.document_type,
      verification_code: document.verification_code,
      issued_at: document.created_at,
      student_info: {
        student_no: document.students?.student_no,
        first_name: document.students?.first_name,
        last_name: document.students?.last_name,
        department: document.students?.department
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
