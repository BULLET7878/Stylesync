const express = require('express');
const router = express.Router();
const { getUsers, getUserCount, upgradeToSeller } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/upgrade')
  .put(protect, upgradeToSeller);

router.route('/')
  .get(protect, admin, getUsers);

router.route('/count')
  .get(protect, admin, getUserCount);

module.exports = router;
