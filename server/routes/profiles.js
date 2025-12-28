const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// GET /api/profiles/:travelerId - Get travel profile
router.get('/:travelerId', profileController.getProfile.bind(profileController));

// POST /api/profiles/:travelerId/enrich - Trigger profile enrichment
router.post('/:travelerId/enrich', profileController.enrichProfile.bind(profileController));

// GET /api/profiles/:travelerId/stats - Get travel statistics
router.get('/:travelerId/stats', profileController.getTravelStats.bind(profileController));

module.exports = router;
