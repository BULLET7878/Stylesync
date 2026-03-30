const selectionController = require('../controllers/selectionController');
const { protect } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();

router.get('/curated', protect, selectionController.getCuratedRecommendations);
router.get('/pairings/:productId', selectionController.getStylePairings);

module.exports = router;
