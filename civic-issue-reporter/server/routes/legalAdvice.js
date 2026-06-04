// routes/legalAdvice.js - AI legal assistance endpoint
const express = require('express');
const router = express.Router();
const { getLegalAdvice, getMockLegalAdvice } = require('../utils/openaiHelper');

// ============================================================
// POST /api/legal-advice - Get AI legal guidance with validation
// ============================================================
router.post('/', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a detailed question (at least 10 characters)',
      });
    }

    let result;

    // Use OpenAI if API key is configured, otherwise use mock
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
      console.log('🤖 Using OpenAI for legal advice...');
      result = await getLegalAdvice(query);
    } else {
      console.log('🤖 Using mock legal advice (no OpenAI key)...');
      result = getMockLegalAdvice(query);
    }

    res.json(result);
  } catch (error) {
    console.error('Error generating legal advice:', error);
    // Fallback to mock if OpenAI fails
    const result = getMockLegalAdvice(req.body.query || '');
    res.json(result);
  }
});

module.exports = router;
