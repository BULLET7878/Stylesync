const express = require('express');
const router = express.Router();
const { addOrderItems, getOrderById, getMyOrders, getSellerOrders, updateOrderToPaid, updateOrderToDelivered, getAdminStats } = require('../controllers/orderController');
const { protect, seller } = require('../middleware/authMiddleware');

router.route('/stats')
  .get(protect, seller, getAdminStats);

router.route('/seller')
  .get(protect, seller, getSellerOrders);

router.route('/')
  .post(protect, addOrderItems);
  
router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/pay')
  .put(protect, updateOrderToPaid);

router.route('/:id/deliver')
  .put(protect, seller, updateOrderToDelivered);

module.exports = router;
