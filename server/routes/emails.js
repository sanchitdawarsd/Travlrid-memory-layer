const express = require('express');
const router = express.Router();
const emailExtractor = require('../services/emailExtractor');
const prisma = require('../config/database');

/**
 * POST /api/emails/process
 * Process a single email and extract booking data
 */
router.post('/process', async (req, res) => {
  try {
    const { emailData } = req.body;

    if (!emailData) {
      return res.status(400).json({ error: 'emailData is required' });
    }

    // Process email synchronously
    const result = await emailExtractor.processEmail(emailData);

    res.json({
      success: true,
      message: 'Email processed successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error processing email:', error);
    res.status(500).json({
      error: 'Failed to process email',
      details: error.message,
    });
  }
});

/**
 * POST /api/emails/queue
 * Queue an email for async processing
 */
router.post('/queue', async (req, res) => {
  try {
    const { emailData } = req.body;

    if (!emailData) {
      return res.status(400).json({ error: 'emailData is required' });
    }

    // Add email to queue
    const result = await emailExtractor.processEmailWithQueue(emailData);

    // Record in email_queue table
    await prisma.emailQueue.create({
      data: {
        emailId: emailData.id || emailData.messageId || `temp-${Date.now()}`,
        travelerEmail: emailData.from || null,
        subject: emailData.subject || null,
        sender: emailData.from || null,
        receivedDate: emailData.date ? new Date(emailData.date) : new Date(),
        processingStatus: 'PENDING',
      },
    });

    res.json({
      success: true,
      message: 'Email queued for processing',
      data: result,
    });
  } catch (error) {
    console.error('Error queueing email:', error);
    res.status(500).json({
      error: 'Failed to queue email',
      details: error.message,
    });
  }
});

/**
 * GET /api/emails/queue/status
 * Get email queue status
 */
router.get('/queue/status', async (req, res) => {
  try {
    const { status = 'PENDING', limit = 50 } = req.query;

    const emails = await prisma.emailQueue.findMany({
      where: {
        processingStatus: status.toUpperCase(),
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    const counts = await prisma.emailQueue.groupBy({
      by: ['processingStatus'],
      _count: true,
    });

    res.json({
      emails,
      counts: counts.reduce((acc, item) => {
        acc[item.processingStatus] = item._count;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error('Error fetching queue status:', error);
    res.status(500).json({
      error: 'Failed to fetch queue status',
      details: error.message,
    });
  }
});

module.exports = router;
