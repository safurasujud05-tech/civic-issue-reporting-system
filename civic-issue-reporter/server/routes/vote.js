const express = require('express');
const mockDb = require('../db/mockDb');

const router = express.Router();

// POST /api/vote/:id
router.post('/:id', (req, res) => {
  try {
    const { type } = req.body;
    if (!type || (type !== 'upvote' && type !== 'downvote')) {
      return res.status(400).json({ success: false, message: 'Invalid vote type' });
    }

    // simple voter id: prefer authenticated user, else use IP-based anon id
    const voterId = req.user?.id || `anon:${req.ip}`;

    const result = mockDb.addVote(req.params.id, voterId, type);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const updatedComplaint = {
      ...result.complaint,
      user_vote: result.complaint.votesByUser[voterId] || 0,
    };

    if (!result.changed) {
      return res.status(200).json({ success: true, message: 'Vote unchanged', complaint: updatedComplaint });
    }

    res.json({ success: true, message: 'Vote recorded', complaint: updatedComplaint });
  } catch (error) {
    console.error('Vote error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to record vote' });
  }
});

module.exports = router;
