const express = require('express');
const router = express.Router();
const { getRecommendations, getOutfitSuggestions } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.route('/recommendations').get(protect, getRecommendations);
router.route('/outfit/:productId').get(getOutfitSuggestions);

module.exports = router;
