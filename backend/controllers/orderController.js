const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    } else {
      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      const createdOrder = await order.save();
      res.status(201).json(createdOrder);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders for a seller (orders that contain their products)
// @route   GET /api/orders/seller
// @access  Private/Seller
const getSellerOrders = async (req, res) => {
  try {
    // Find all products belonging to this seller
    const Product = require('../models/Product');
    const sellerProducts = await Product.find({ user: req.user._id }).select('_id');
    const productIds = sellerProducts.map(p => p._id);

    // Find orders that contain any of these products
    const orders = await Order.find({
      'orderItems.product': { $in: productIds }
    }).populate('user', 'name email');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Seller
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.status = 'Delivered';

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Admin/Seller insights
// @route   GET /api/orders/stats
// @access  Private/Seller
const getAdminStats = async (req, res) => {
  try {
    const Product = require('../models/Product');
    const orders = await Order.find({}).populate('orderItems.product');
    const totalProducts = await Product.countDocuments({});
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    const productSales = {};
    const categorySales = {};
    const dailyRevenue = {};

    orders.forEach(order => {
      // Daily Revenue Trends
      if (order.createdAt) {
        const date = order.createdAt.toISOString().split('T')[0];
        dailyRevenue[date] = (dailyRevenue[date] || 0) + (order.totalPrice || 0);
      }

      if (order.orderItems) {
        order.orderItems.forEach(item => {
          if (item.product && typeof item.product === 'object') {
            const productId = item.product._id;
            const category = item.product.category || 'Uncategorized';
            
            productSales[productId] = (productSales[productId] || 0) + (item.qty || 0);
            categorySales[category] = (categorySales[category] || 0) + (item.qty || 0);
          }
        });
      }
    });

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, qty]) => ({ id, qty }));

    const topCategories = Object.entries(categorySales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));

    const revenueTrends = Object.entries(dailyRevenue)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-7)
      .map(([date, amount]) => ({ date, amount }));

    const mostViewedProducts = await Product.find({})
      .sort({ views: -1 })
      .limit(5)
      .select('title views price image');

    res.json({ 
      totalProducts, 
      totalOrders, 
      totalRevenue, 
      topProducts, 
      topCategories, 
      revenueTrends,
      mostViewedProducts 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getSellerOrders,
  updateOrderToDelivered,
  getAdminStats,
};
