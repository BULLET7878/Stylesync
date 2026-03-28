const express = require('express');
const router = express.Router();
const { getUsers, getUserCount, upgradeToSeller } = require('../controllers/authController');
const { protect, seller } = require('../middleware/authMiddleware');

router.route('/upgrade')
  .put(protect, upgradeToSeller);

router.route('/')
  .get(protect, seller, getUsers);

router.route('/count')
  .get(protect, seller, getUserCount);

module.exports = router;
