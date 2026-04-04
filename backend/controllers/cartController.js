const Cart = require('../models/Cart');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getUserCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, cartItems: [] });
    } else {
      // Self-heal: merge duplicates
      const uniqueItems = {};
      let hasDuplicates = false;
      for (const item of cart.cartItems) {
        const prodId = item.product.toString();
        if (uniqueItems[prodId]) {
          uniqueItems[prodId].qty += item.qty;
          hasDuplicates = true;
        } else {
          uniqueItems[prodId] = item;
        }
      }
      if (hasDuplicates) {
        cart.cartItems = Object.values(uniqueItems);
        await cart.save();
      }
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addItemToCart = async (req, res) => {
  try {
    const { product, name, image, price, qty } = req.body;
    
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, cartItems: [] });
    }

    const productIdStr = (typeof product === 'object' && product !== null) ? (product._id || product).toString() : product.toString();
    const existItem = cart.cartItems.find(x => x.product.toString() === productIdStr);

    if (existItem) {
      existItem.qty = qty; // update quantity
    } else {
      cart.cartItems.push({ product: productIdStr, name, image, price, qty });
    }

    cart.markModified('cartItems');
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeItemFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.cartItems = cart.cartItems.filter(x => x.product.toString() !== req.params.id);
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.cartItems = [];
      await cart.save();
      res.json({ message: 'Cart cleared' });
    } else {
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserCart, addItemToCart, removeItemFromCart, clearCart };
