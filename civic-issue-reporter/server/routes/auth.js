const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mockDb = require('../db/mockDb');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'civic-secret';
const JWT_EXPIRES_IN = '7d';

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    const existingUser = mockDb.findUserByEmail(email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email.toLowerCase() === 'admin@civic.ai' ? 'admin' : 'citizen';
    const user = mockDb.createUser({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Failed to register user.' });
  }
});

// Login existing user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = mockDb.findUserByEmail(email.toLowerCase());
    if (!user) {
      // Auto-register missing user for demo convenience
      const hashedPassword = await bcrypt.hash(password, 10);
      const nameFromEmail = email.split('@')[0] || 'Citizen';
      const role = email.toLowerCase() === 'admin@civic.ai' ? 'admin' : 'citizen';
      const newUser = mockDb.createUser({ name: nameFromEmail, email: email.toLowerCase(), password: hashedPassword, role });
      const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      return res.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }, token });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role || 'citizen' }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Failed to login.' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  res.json({ success: true, user: { id: req.user.id, name: req.user.name, email: req.user.email } });
});

module.exports = router;
