require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize database connection
const prisma = require('./config/database');

const gmailRoutes = require('./routes/gmail');
const outlookRoutes = require('./routes/outlook');
const bookingsRoutes = require('./routes/bookings');

// Memory layer routes
const travelersRoutes = require('./routes/travelers');
const bookingsMemoryRoutes = require('./routes/bookings-memory');
const profilesRoutes = require('./routes/profiles');
const emailsRoutes = require('./routes/emails');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: false // No longer needed with token-based auth
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Routes
app.use('/auth/gmail', gmailRoutes);
app.use('/auth/outlook', outlookRoutes);
app.use('/api/bookings', bookingsRoutes);

// Memory layer API routes
app.use('/api/travelers', travelersRoutes);
app.use('/api/bookings-memory', bookingsMemoryRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/emails', emailsRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      message: 'Email scraper API is running',
      database: 'connected',
      memoryLayer: 'active'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: 'Email scraper API is running',
      database: 'disconnected',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

