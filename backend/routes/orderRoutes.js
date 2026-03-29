const express = require('express');
const router = express.Router();
const { 
  addOrderItems, 
  getOrderById, 
  getMyOrders, 
  getSellerOrders, 
  updateOrderToPaid, 
  updateOrderToDelivered, 
  getAdminStats,
  submitPaymentDetails,
  confirmOrderPayment,
  rejectOrderPayment
} = require('../controllers/orderController');
const { protect, seller } = require('../middleware/authMiddleware');

router.route('/stats').get(protect, seller, getAdminStats);
router.route('/seller').get(protect, seller, getSellerOrders);
router.route('/').post(protect, addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);

router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/submit-payment').put(protect, submitPaymentDetails);
router.route('/:id/confirm-payment').put(protect, seller, confirmOrderPayment);
router.route('/:id/reject-payment').put(protect, seller, rejectOrderPayment);
router.route('/:id/deliver').put(protect, seller, updateOrderToDelivered);

module.exports = router;
