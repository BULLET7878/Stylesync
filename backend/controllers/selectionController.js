const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get Curated Product Recommendations
// @route   GET /api/featured/curated
// @access  Private
const getCuratedRecommendations = async (req, res) => {
  try {
    // Intelligent logic: Find categories the user has ordered
    const orders = await Order.find({ user: req.user._id }).populate('orderItems.product');
    let userCategories = new Set();
    
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.product && item.product.category) {
          userCategories.add(item.product.category);
        }
      });
    });

    let recommendQuery = {};
    if (userCategories.size > 0) {
      recommendQuery = { category: { $in: Array.from(userCategories) } };
    }

    // Fetch top rated products in those categories, or overall top rated if no orders
    const products = await Product.find(recommendQuery)
      .sort({ rating: -1 })
      .limit(8);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Style Pairing Suggestions for a Product
// @route   GET /api/featured/pairings/:productId
// @access  Public
const getStylePairings = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { category, tags } = product;

    // Pairing logic: Find products in complementary categories
    let complementaryCategories = [];
    const lowerCat = category.toLowerCase();
    if (lowerCat === 'shirts' || lowerCat === 'tshirts') {
      complementaryCategories = ['Trousers', 'Jeans', 'Shorts', 'Shoes'];
    } else if (lowerCat === 'trousers' || lowerCat === 'jeans' || lowerCat === 'shorts') {
      complementaryCategories = ['Shirts', 'T-Shirts', 'Shoes'];
    } else if (lowerCat === 'shoes') {
      complementaryCategories = ['Trousers', 'Jeans', 'Shirts'];
    } else {
      complementaryCategories = ['Accessories'];
    }

    const suggestions = await Product.find({
      category: { $in: complementaryCategories },
      tags: { $in: tags && tags.length > 0 ? tags : ['casual', 'summer', 'formal'] } 
    }).limit(4);

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCuratedRecommendations, getStylePairings };
