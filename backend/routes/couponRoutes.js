const express = require('express');
const router = express.Router();
const { validateCoupon, seedCoupons } = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/validate', protect, validateCoupon);
router.get('/seed', protect, admin, seedCoupons);

module.exports = router;
