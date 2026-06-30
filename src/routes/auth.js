const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

// Step 1 - Check if email exists
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    const student = await prisma.students.findFirst({ where: { email } });

    if (!student) {
      return res.json({ exists: false });
    }

    const hasPassword = !!student.passwordHash;
    res.json({ exists: true, hasPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Step 2a - Register (set password for first time)
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await prisma.students.findFirst({ where: { email } });
    if (!student) {
      return res.status(404).json({ error: 'Email not found in system' });
    }
    if (student.passwordHash) {
      return res.status(400).json({ error: 'Password already set, please login' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const updated = await prisma.students.update({
      where: { id: student.id },
      data: { passwordHash: passwordHash },
    });

    const token = jwt.sign(
      { id: updated.id, email: updated.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      student: {
        id: updated.id,
        email: updated.email,
        first_name: updated.first_name,
        last_name: updated.last_name,
        student_no: updated.student_no,
        department: updated.department,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Step 2b - Login (existing password)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email, password);

    const student = await prisma.students.findFirst({ where: { email } });
    console.log('Student found:', student ? student.email : 'NOT FOUND');
    console.log('Has password hash:', student?.passwordHash ? 'YES' : 'NO');

    if (!student || !student.passwordHash) {
      return res.status(404).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, student.passwordHash);
    console.log('Password valid:', isValid);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: student.id, email: student.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      student: {
        id: student.id,
        email: student.email,
        first_name: student.first_name,
        last_name: student.last_name,
        student_no: student.student_no,
        department: student.department,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test-hash', async (req, res) => {
  const { password, hash } = req.body;
  const result = await bcrypt.compare(password, hash);
  res.json({ result });
});

module.exports = router;
