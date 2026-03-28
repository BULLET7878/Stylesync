const express = require('express');
const router = express.Router();
const { getUserCart, addItemToCart, removeItemFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getUserCart)
  .post(protect, addItemToCart)
  .delete(protect, clearCart);

router.route('/:id')
  .delete(protect, removeItemFromCart);

module.exports = router;
