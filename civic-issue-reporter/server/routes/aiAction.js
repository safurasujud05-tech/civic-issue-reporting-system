// routes/aiAction.js - AI Action Engine for complaint analysis
const express = require('express');
const router = express.Router();
const { analyzeComplaintText, createMockActionAnalysis } = require('../utils/openaiHelper');

// POST /api/ai-action
// Accepts a complaint text and returns structured action items plus advice.
router.post('/', async (req, res) => {
  try {
    const complaintText = req.body.complaint_text || req.body.complaint || '';

    if (!complaintText || complaintText.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a detailed complaint text with at least 20 characters.',
      });
    }

    let result;
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
      console.log('🤖 Using OpenAI for AI Action analysis...');
      result = await analyzeComplaintText(complaintText);
    } else {
      console.log('🤖 Using mock AI Action analysis (no OpenAI key)...');
      result = createMockActionAnalysis(complaintText);
      result.source = 'Mock';
      result.disclaimer = 'This is general information only, not legal advice. Consult a lawyer for specific cases.';
    }

    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('AI Action Engine error:', error.message);
    const result = createMockActionAnalysis(req.body.complaint_text || req.body.complaint || '');
    return res.json({
      success: true,
      ...result,
      source: 'Mock',
      disclaimer: 'This is general information only, not legal advice. Consult a lawyer for specific cases.',
    });
  }
});

module.exports = router;
