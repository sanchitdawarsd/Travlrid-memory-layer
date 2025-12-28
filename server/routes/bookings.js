const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const gmailService = require('../services/gmailService');
const outlookService = require('../services/outlookService');
const bookingParser = require('../services/bookingParser');
const emailExtractor = require('../services/emailExtractor');
const prisma = require('../config/database');

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.provider) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// Fetch and parse bookings
router.get('/fetch', requireAuth, async (req, res) => {
  try {
    let emails = [];

    if (req.session.provider === 'gmail') {
      emails = await gmailService.getBookingEmails(req.session.gmailTokens);
    } else if (req.session.provider === 'outlook') {
      emails = await outlookService.getBookingEmails(req.session.outlookTokens.accessToken);
    }

    const parsedBookings = bookingParser.parseMultipleEmails(emails);
    
    // Save to JSON file (legacy support)
    const dataDir = path.join(__dirname, '../../data');
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `bookings_${req.session.userEmail}_${timestamp}.json`;
    const filepath = path.join(dataDir, filename);

    await fs.writeFile(filepath, JSON.stringify(parsedBookings, null, 2));

    // Process emails through memory layer (async via queue)
    const memoryResults = {
      processed: 0,
      failed: 0,
      errors: [],
    };

    // Queue all emails for processing with GPT-4
    for (const email of emails) {
      try {
        await emailExtractor.processEmailWithQueue({
          ...email,
          from: email.from || req.session.userEmail,
        });
        memoryResults.processed++;
      } catch (error) {
        memoryResults.failed++;
        memoryResults.errors.push({
          emailId: email.id,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      data: parsedBookings,
      savedTo: filename,
      memoryLayer: {
        queued: memoryResults.processed,
        failed: memoryResults.failed,
        errors: memoryResults.errors,
      },
      stats: {
        totalEmails: emails.length,
        flights: parsedBookings.flights.length,
        hotels: parsedBookings.hotels.length,
        trains: parsedBookings.trains.length,
        unparsed: parsedBookings.unparsed.length
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch bookings',
      details: error.message 
    });
  }
});

// Get saved bookings list
router.get('/saved', requireAuth, async (req, res) => {
  try {
    const dataDir = path.join(__dirname, '../../data');
    const files = await fs.readdir(dataDir);
    
    const userFiles = files.filter(f => 
      f.startsWith(`bookings_${req.session.userEmail}`) && f.endsWith('.json')
    );

    const fileDetails = await Promise.all(
      userFiles.map(async (filename) => {
        const filepath = path.join(dataDir, filename);
        const stats = await fs.stat(filepath);
        return {
          filename,
          created: stats.mtime,
          size: stats.size
        };
      })
    );

    res.json({ files: fileDetails });
  } catch (error) {
    console.error('Error getting saved bookings:', error);
    res.status(500).json({ error: 'Failed to get saved bookings' });
  }
});

// Get specific booking file
router.get('/saved/:filename', requireAuth, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security check - only allow access to user's own files
    if (!filename.startsWith(`bookings_${req.session.userEmail}`)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filepath = path.join(__dirname, '../../data', filename);
    const data = await fs.readFile(filepath, 'utf-8');
    
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading booking file:', error);
    res.status(404).json({ error: 'File not found' });
  }
});

module.exports = router;

