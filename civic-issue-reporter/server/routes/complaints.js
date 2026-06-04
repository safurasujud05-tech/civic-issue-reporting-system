// routes/complaints.js - All complaint-related API routes
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { classifyIssue } = require('../utils/aiHelpers');
const { sendStatusNotification } = require('../utils/notification');
const { isValidComplaintDescription, isValidImage } = require('../utils/contentValidator');
const mockDb = require('../db/mockDb');

// ============================================================
// FILE UPLOAD CONFIGURATION (Multer)
// ============================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// ============================================================
// POST /api/complaints - Submit a new complaint
// ============================================================
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, latitude, longitude, location_name } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
      });
    }

    // Validate complaint description is not rubbish/spam
    if (!isValidComplaintDescription(description)) {
      // Delete uploaded file if it exists
      if (req.file) {
        const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
        fs.unlink(filePath, (err) => { if (err) console.error('File delete error:', err); });
      }
      return res.status(400).json({
        success: false,
        message: 'Complaint description appears to be spam or invalid. Please provide a genuine issue description.',
      });
    }

    // Validate image if uploaded
    if (req.file) {
      const fileBuffer = fs.readFileSync(path.join(__dirname, '..', 'uploads', req.file.filename));
      if (!isValidImage(fileBuffer, req.file.filename)) {
        // Delete invalid file
        const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
        fs.unlink(filePath, (err) => { if (err) console.error('File delete error:', err); });
        return res.status(400).json({
          success: false,
          message: 'Image appears to be invalid or tampered. Please upload a genuine image.',
        });
      }
    }

    // Auto-classify the issue using AI helper
    const { category, department, confidence } = classifyIssue(title, description);

    // Build complaint object
    const complaintData = {
      title: title.trim(),
      description: description.trim(),
      category,
      department,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      location_name: location_name || 'Location not specified',
      image_url: req.file ? `/uploads/${req.file.filename}` : null,
      user_id: req.user?.id || null,
      reporter_name: req.user?.name || null,
      reporter_email: req.user?.email || null,
    };

    // Save to mock DB (replace with real DB in production)
    const newComplaint = mockDb.createComplaint(complaintData);

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint: newComplaint,
      classification: { category, department, confidence },
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit complaint. Please try again.',
    });
  }
});

// ============================================================
// GET /api/complaints - Get all complaints (with optional filters)
// ============================================================
router.get('/', async (req, res) => {
  try {
    const { status, category, mine } = req.query;
    let complaints = mockDb.getAllComplaints();

    // Annotate each complaint with user's vote (if any) to help the frontend disable multiple votes
    const voterId = req.user?.id || `anon:${req.ip}`;
    complaints = complaints.map(c => {
      const userVote = (c.votesByUser && c.votesByUser[voterId]) || 0;
      return { ...c, user_vote: userVote };
    });

    if (mine === 'true' && req.user) {
      complaints = complaints.filter(c => c.user_id === req.user.id);
    }

    // Apply filters if provided
    if (status) {
      complaints = complaints.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }
    if (category) {
      complaints = complaints.filter(c => c.category.toLowerCase() === category.toLowerCase());
    }

    // Sort by votes descending so highest-voted issues appear first
    complaints.sort((a, b) => (b.votes || 0) - (a.votes || 0));

    res.json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch complaints' });
  }
});

// ============================================================
// GET /api/complaints/analytics - Complaint analytics by status and category
// ============================================================
router.get('/analytics', async (req, res) => {
  try {
    const complaints = mockDb.getAllComplaints();
    const categoryCounts = {};
    const statusCounts = {};
    const dailyCounts = {};

    complaints.forEach((complaint) => {
      categoryCounts[complaint.category] = (categoryCounts[complaint.category] || 0) + 1;
      statusCounts[complaint.status] = (statusCounts[complaint.status] || 0) + 1;

      const day = new Date(complaint.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      });
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });

    res.json({
      success: true,
      totalComplaints: complaints.length,
      categoryCounts,
      statusCounts,
      dailyCounts,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

// ============================================================
// GET /api/complaints/:id - Get a single complaint
// ============================================================
router.get('/:id', async (req, res) => {
  try {
    const complaint = mockDb.getComplaintById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const voterId = req.user?.id || `anon:${req.ip}`;
    const userVote = (complaint.votesByUser && complaint.votesByUser[voterId]) || 0;

    res.json({ success: true, complaint: { ...complaint, user_vote: userVote } });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch complaint' });
  }
});

// ============================================================
// PATCH /api/complaints/:id/status - Update complaint status
// ============================================================
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Submitted', 'In Progress', 'Resolved'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const updated = mockDb.updateStatus(req.params.id, status);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    await sendStatusNotification(updated);

    res.json({ success: true, message: 'Status updated', complaint: updated });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

module.exports = router;
