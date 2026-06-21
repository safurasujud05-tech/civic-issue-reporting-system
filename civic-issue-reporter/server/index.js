// index.js - Main Express server
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRouter = require('./routes/auth');
const complaintsRouter = require('./routes/complaints');
const legalAdviceRouter = require('./routes/legalAdvice');
const aiActionRouter = require('./routes/aiAction');
const whatsappRouter = require('./routes/whatsapp');
const authMiddleware = require('./utils/authMiddleware');
const dashboardRouter = require('./routes/dashboard');
const voteRouter = require('./routes/vote');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS - allow frontend to communicate with backend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

// ============================================================
// ROUTES
// ============================================================

// Health check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    message: '🏛️ Civic Issue Reporting API is running',
    version: '1.0.0',
    endpoints: {
      complaints: '/api/complaints',
      legalAdvice: '/api/legal-advice',
      aiAction: '/api/ai-action',
      status: '/api/status',
    },
  });
});

app.use('/api/auth', authRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/legal-advice', legalAdviceRouter);
app.use('/api/ai-action', aiActionRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/dashboard-stats', dashboardRouter);
app.use('/api/vote', voteRouter);

// Serve frontend build if available
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return res.status(404).json({ success: false, message: `Route ${req.path} not found` });
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  // 404 handler for API and uploads when frontend build is not present
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.path} not found` });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log('\n🚀 ================================');
  console.log(`🏛️  Civic Issue Reporter API`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
  console.log('🚀 ================================\n');
});

module.exports = app;