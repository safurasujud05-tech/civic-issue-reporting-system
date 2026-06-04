const express = require('express');
const mockDb = require('../db/mockDb');

const router = express.Router();

// GET /api/dashboard-stats
router.get('/', (req, res) => {
  try {
    const complaints = mockDb.getAllComplaints();

    const total = complaints.length;

    const categories = ['Electricity', 'Water', 'Roads', 'Garbage'];
    const byCategory = {};
    categories.forEach(c => byCategory[c] = 0);

    const statuses = ['Submitted', 'In Progress', 'Resolved'];
    const byStatus = {};
    statuses.forEach(s => byStatus[s] = 0);

    complaints.forEach(c => {
      const cat = c.category || 'Uncategorized';
      if (byCategory[cat] !== undefined) byCategory[cat]++;
      else byCategory[cat] = (byCategory[cat] || 0) + 1;

      const st = c.status || 'Submitted';
      if (byStatus[st] !== undefined) byStatus[st]++;
      else byStatus[st] = (byStatus[st] || 0) + 1;
    });

    // recent complaints (most recent first)
    const recentComplaints = complaints
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 8)
      .map(c => ({ id: c.id, title: c.title, category: c.category, status: c.status, created_at: c.created_at, location_name: c.location_name }));

    res.json({
      total,
      byCategory,
      byStatus,
      recentComplaints,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to compute dashboard stats' });
  }
});

module.exports = router;
