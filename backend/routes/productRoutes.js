const express = require('express');
const router = express.Router();
const {
  getProducts,
  getSellerProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  seedProducts
} = require('../controllers/productController');
const { protect, seller, admin } = require('../middleware/authMiddleware');

router.get('/seed', seedProducts);
router.get('/seller', protect, seller, getSellerProducts);

router.route('/')
  .get(getProducts)
  .post(protect, seller, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, seller, updateProduct)
  .delete(protect, seller, deleteProduct);

router.route('/:id/reviews')
  .post(protect, createProductReview);

module.exports = router;
