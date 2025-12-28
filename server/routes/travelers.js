const express = require('express');
const router = express.Router();
const travelerController = require('../controllers/travelerController');

// GET /api/travelers/:id - Get traveler by ID
router.get('/:id', travelerController.getTravelerById.bind(travelerController));

// GET /api/travelers/email/:email - Get traveler by email
router.get('/email/:email', travelerController.getTravelerByEmail.bind(travelerController));

// GET /api/travelers - Search travelers
router.get('/', travelerController.searchTravelers.bind(travelerController));

// POST /api/travelers - Create or update traveler
router.post('/', travelerController.upsertTraveler.bind(travelerController));

module.exports = router;
