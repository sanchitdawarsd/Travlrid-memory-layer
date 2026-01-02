const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const gmailService = require('../services/gmailService');
const outlookService = require('../services/outlookService');
const bookingParser = require('../services/bookingParser');
const emailExtractor = require('../services/emailExtractor');
const prisma = require('../config/database');

// Middleware to check authentication from token
const requireAuth = (req, res, next) => {
  const authToken = req.headers['x-auth-token'];
  
  if (!authToken) {
    return res.status(401).json({ 
      error: 'Not authenticated',
      message: 'Please log in again'
    });
  }

  try {
    const authData = JSON.parse(Buffer.from(authToken, 'base64').toString());
    
    // Validate auth data structure
    if (!authData.provider || !authData.tokens || !authData.email) {
      return res.status(401).json({ 
        error: 'Invalid authentication token',
        message: 'Please log in again'
      });
    }
    
    // Attach auth data to request
    req.authData = authData;
    next();
  } catch (error) {
    console.error('Error parsing auth token:', error);
    return res.status(401).json({ 
      error: 'Invalid authentication token',
      message: 'Please log in again'
    });
  }
};

// Fetch and parse bookings

router.get('/fetch', requireAuth, async (req, res) => {
  try {
    let emails = [];
    const { provider, tokens, email: userEmail } = req.authData;

    if (provider === 'gmail') {
      const result = await gmailService.getBookingEmails(tokens);
      emails = result.emails || result; // Handle both old and new format
      console.log(`Fetched ${emails.length} emails, ${result} total`);
      // write all emails to a file
      await fs.writeFile('emails.json', JSON.stringify(emails, null, 2));
    } else if (provider === 'outlook') {
      emails = await outlookService.getBookingEmails(tokens.accessToken);
    }
    const parseResult = bookingParser.parseMultipleEmails(emails);
    const parsedBookings = parseResult.bookings;
    const parseStats = parseResult.stats;
    
    // Save to JSON file (legacy support)
    const dataDir = path.join(__dirname, '../../data');
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `bookings_${userEmail}_${timestamp}.json`;
    const filepath = path.join(dataDir, filename);

    await fs.writeFile(filepath, JSON.stringify(parseResult, null, 2));

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
          from: email.from || userEmail,
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
        buses: parsedBookings.buses.length,
        cabs: parsedBookings.cabs.length,
        rentals: parsedBookings.rentals.length,
        events: parsedBookings.events.length,
        unparsed: parsedBookings.unparsed.length,
        parseStats: parseStats
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
    const { email: userEmail } = req.authData;
    const dataDir = path.join(__dirname, '../../data');
    const files = await fs.readdir(dataDir);
    
    const userFiles = files.filter(f => 
      f.startsWith(`bookings_${userEmail}`) && f.endsWith('.json')
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
    const { email: userEmail } = req.authData;
    
    // Security check - only allow access to user's own files
    if (!filename.startsWith(`bookings_${userEmail}`)) {
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

