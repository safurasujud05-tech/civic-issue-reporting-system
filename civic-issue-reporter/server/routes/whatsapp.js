// routes/whatsapp.js - WhatsApp Bot integration for reporting issues
const express = require('express');
const router = express.Router();
const mockDb = require('../db/mockDb');

// ============================================================
// POST /api/whatsapp/init - Initiate WhatsApp conversation
// ============================================================
router.post('/init', async (req, res) => {
  try {
    // In a real implementation, this would:
    // 1. Call WhatsApp Business API to send a message
    // 2. Create a session for the user
    // 3. Return a conversation ID

    // For now, return a simple response with instructions
    res.json({
      success: true,
      message: 'WhatsApp integration initialized',
      instructions: {
        step1: 'Save our WhatsApp number to your contacts',
        step2: 'Send a message starting with "Report" to initiate a complaint',
        step3: 'Follow the bot prompts to describe your issue',
        step4: 'Our system will auto-classify and route your complaint',
      },
      phone: process.env.WHATSAPP_BOT_NUMBER || '+1234567890',
      conversationId: `wa_${Date.now()}`,
    });
  } catch (error) {
    console.error('WhatsApp init error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize WhatsApp conversation',
    });
  }
});

// ============================================================
// POST /api/whatsapp/webhook - Receive incoming WhatsApp messages
// ============================================================
router.post('/webhook', async (req, res) => {
  try {
    const { from, message, timestamp } = req.body;

    if (!from || !message) {
      return res.status(400).json({
        success: false,
        message: 'From and message are required',
      });
    }

    // Parse the incoming message
    const messageText = message.toLowerCase();

    // Keyword-based routing
    if (messageText.startsWith('report')) {
      // Initiate complaint reporting flow
      return res.json({
        success: true,
        response: 'Thank you for reporting! Please describe the civic issue you want to report. What is the main problem?',
      });
    }

    if (messageText.startsWith('status')) {
      // Check complaint status
      return res.json({
        success: true,
        response: 'To check your complaint status, please provide your complaint ID. You can find it in your confirmation message.',
      });
    }

    if (messageText.startsWith('help')) {
      // Show help options
      return res.json({
        success: true,
        response: `Available commands:
1. "Report" - Report a new civic issue
2. "Status" - Check complaint status
3. "Legal" - Get legal advice
4. "Help" - Show this menu`,
      });
    }

    // If message matches a report flow, create complaint
    if (messageText.length > 10) {
      const complaint = mockDb.createComplaint({
        title: 'WhatsApp Report',
        description: message,
        category: 'Other',
        department: 'General',
        latitude: null,
        longitude: null,
        location_name: 'Reported via WhatsApp',
        image_url: null,
        reporter_phone: from,
        reporter_name: `WhatsApp User ${from.slice(-4)}`,
      });

      return res.json({
        success: true,
        response: `Thank you for your report! Your complaint has been registered with ID: ${complaint.id}. You can track its status using this ID.`,
        complaintId: complaint.id,
      });
    }

    res.json({
      success: true,
      response: 'I did not understand that. Type "Help" to see available commands.',
    });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process WhatsApp message',
    });
  }
});

module.exports = router;
