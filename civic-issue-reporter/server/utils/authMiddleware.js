const jwt = require('jsonwebtoken');
const mockDb = require('../db/mockDb');

const JWT_SECRET = process.env.JWT_SECRET || 'civic-secret';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = mockDb.getUserById(payload.id);
    if (!user) return next();
    req.user = user;
    next();
  } catch (error) {
    console.warn('Invalid auth token:', error.message);
    next();
  }
}

module.exports = authMiddleware;
