const selectionController = require('../controllers/selectionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/curated', protect, selectionController.getCuratedRecommendations);
router.get('/pairings/:productId', selectionController.getStylePairings);

module.exports = router;
