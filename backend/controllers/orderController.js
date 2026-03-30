const Order = require('../models/Order');
const Product = require('../models/Product');

// Helper to decrement stock
const decrementStock = async (orderItems) => {
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.countInStock = Math.max(0, product.countInStock - item.qty);
      await product.save();
    }
  }
};

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

    if (req.user && req.user.role === 'seller') {
      return res.status(403).json({ message: 'Sellers are not allowed to place orders' });
    }

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    } else {
      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        paymentStatus: 'pending',
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
    }).populate('user', 'name email phone').sort({ createdAt: -1 });

    // Return full address — seller needs it to ship the order
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order for manual verification (submission of UTR)
// @route   PUT /api/orders/:id/submit-payment
// @access  Private
const submitPaymentDetails = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      order.paymentResult = {
        ...order.paymentResult,
        transactionId,
        status: 'PENDING_VERIFICATION',
        update_time: new Date().toISOString(),
      };
      order.paymentStatus = 'pending_verification';
      order.status = 'Processing'; // Move out of 'Pending' as buyer has acted

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to paid (By Seller/Admin)
// @route   PUT /api/orders/:id/confirm-payment
// @access  Private/Seller
const confirmOrderPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentStatus = 'paid';
      order.paymentResult.status = 'PAID';
      
      // Decrement stock upon payment confirmation
      await decrementStock(order.orderItems);
      
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to paid (Generic/Automated)
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id || `MOCK_PAY_${Date.now()}`,
        status: req.body.status || 'COMPLETED',
        update_time: req.body.update_time || new Date().toISOString(),
        email_address: req.body.email_address || req.user.email,
      };
      order.paymentStatus = 'paid';

      // Decrement stock upon automated payment
      await decrementStock(order.orderItems);

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to shipped (By Seller)
// @route   PUT /api/orders/:id/ship
// @access  Private/Seller
const updateOrderToShipped = async (req, res) => {
  try {
    const { trackingNumber, courier } = req.body;
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = 'Shipped';
      order.trackingNumber = trackingNumber || '';
      order.courier = courier || '';
      order.shippedAt = Date.now();
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel order (By Buyer — only if not yet paid/shipped)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (order.isPaid || ['Shipped', 'Delivered'].includes(order.status))
      return res.status(400).json({ message: 'Cannot cancel an order that is already paid or shipped' });
    order.status = 'Cancelled';
    order.paymentStatus = 'failed';
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
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

// @desc    Reject order payment (By Seller/Admin)
// @route   PUT /api/orders/:id/reject-payment
// @access  Private/Seller
const rejectOrderPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = false;
      order.paymentStatus = 'failed';
      order.paymentResult.status = 'REJECTED';
      order.status = 'Cancelled';
      
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
    const isSeller = req.user.role === 'seller';
    
    // If seller, only stats for their products
    const query = {};
    if (isSeller) {
      const sellerProducts = await Product.find({ user: req.user._id }).select('_id');
      const productIds = sellerProducts.map(p => p._id);
      query['orderItems.product'] = { $in: productIds };
    }

    const orders = await Order.find(query).populate({
      path: 'orderItems.product',
      populate: { path: 'user', select: 'name' }
    });

    const totalProducts = isSeller 
      ? await Product.countDocuments({ user: req.user._id })
      : await Product.countDocuments({});
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, order) => {
      // For sellers, only count revenue from THEIR items in this order
      if (isSeller) {
        const sellerItems = order.orderItems.filter(item => 
          item.product && item.product.user && item.product.user._id.toString() === req.user._id.toString()
        );
        return acc + sellerItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
      }
      return acc + (order.totalPrice || 0);
    }, 0);

    const productSales = {};
    const categorySales = {};
    const dailyRevenue = {};

    orders.forEach(order => {
      if (order.orderItems) {
        order.orderItems.forEach(item => {
          if (item.product && typeof item.product === 'object') {
            const productRef = item.product;
            const sellerOfProduct = productRef.user?._id || productRef.user;
            
            // Only count if it's the seller's product (or if user is admin)
            if (!isSeller || (sellerOfProduct && sellerOfProduct.toString() === req.user._id.toString())) {
              const productId = productRef._id;
              const category = productRef.category || 'Uncategorized';
              const itemRevenue = item.price * item.qty;
              
              productSales[productId] = (productSales[productId] || 0) + (item.qty || 0);
              categorySales[category] = (categorySales[category] || 0) + (item.qty || 0);
              
              if (order.createdAt) {
                const date = order.createdAt.toISOString().split('T')[0];
                dailyRevenue[date] = (dailyRevenue[date] || 0) + itemRevenue;
              }
            }
          }
        });
      }
    });

    const revenueTrends = Object.entries(dailyRevenue)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-7)
      .map(([date, amount]) => ({ date, amount }));

    const mostViewedProducts = await Product.find(isSeller ? { user: req.user._id } : {})
      .sort({ views: -1 })
      .limit(5)
      .select('title views price images');

    res.json({ 
      totalProducts, 
      totalOrders, 
      totalRevenue, 
      topProducts: Object.entries(productSales).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([id,qty])=>({id,qty})), 
      topCategories: Object.entries(categorySales).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,qty])=>({name,qty})), 
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
  updateOrderToPaid,
  updateOrderToShipped,
  updateOrderToDelivered,
  cancelOrder,
  getAdminStats,
  submitPaymentDetails,
  confirmOrderPayment,
  rejectOrderPayment,
};
