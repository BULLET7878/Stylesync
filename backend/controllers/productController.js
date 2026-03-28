const Product = require('../models/Product');

// @desc    Fetch all products with optional keyword and filter
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          title: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const category = req.query.category ? { category: req.query.category } : {};

    let sortBy = { createdAt: -1 }; // Default: New Arrivals
    if (req.query.sort === 'price_asc') sortBy = { price: 1 };
    else if (req.query.sort === 'price_desc') sortBy = { price: -1 };
    else if (req.query.sort === 'popularity') sortBy = { rating: -1, numReviews: -1 };

    const products = await Product.find({ ...keyword, ...category })
      .populate('user', 'name')
      .sort(sortBy);
      
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch products for a specific seller
// @route   GET /api/products/seller
// @access  Private/Seller
const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('user', 'name');

    if (product) {
      product.views = (product.views || 0) + 1;
      await product.save();
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Seller
const createProduct = async (req, res) => {
  try {
    const {
      title,
      price,
      description,
      images,
      category,
      countInStock,
      tags
    } = req.body;

    const product = new Product({
      title,
      price,
      user: req.user._id,
      images: images || ['/images/sample.jpg'],
      category,
      countInStock,
      numReviews: 0,
      description,
      tags: tags || []
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Seller
const updateProduct = async (req, res) => {
  try {
    const {
      title,
      price,
      description,
      images,
      category,
      countInStock,
      tags
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      if (product.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'User not authorized' });
      }
      product.title = title || product.title;
      product.price = price || product.price;
      product.description = description || product.description;
      product.images = images || product.images;
      product.category = category || product.category;
      product.countInStock = countInStock || product.countInStock;
      product.tags = tags || product.tags;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Seller
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      if (product.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'User not authorized' });
      }
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed products (Dev utility)
// @route   GET /api/products/seed
// @access  Public
const seedProducts = async (req, res) => {
  try {
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');

    await Product.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.insertMany([{
      name: 'Admin User',
      email: 'admin@example.com',
      password: await bcrypt.hash('123456', 10),
      role: 'admin',
    }, {
      name: 'John Doe',
      email: 'john@example.com',
      password: await bcrypt.hash('123456', 10),
      role: 'buyer',
    }, {
      name: 'Seller User',
      email: 'seller@example.com',
      password: await bcrypt.hash('123456', 10),
      role: 'seller',
    }]);

    const adminUser = createdUsers[0]._id;

    const sampleProducts = [
      {
        title: 'StyleSync Signature Black Hoodie',
        price: 3999,
        category: 'tshirts',
        images: ['/stylesync_hoodie.png'],
        description: 'Our premium signature black hoodie featuring a subtle elegant chest logo.',
        rating: 5,
        numReviews: 120,
        tags: ['casual', 'premium', 'stylesync'],
        countInStock: 200,
        user: adminUser,
      },
      {
        title: 'StyleSync Classic White Tee',
        price: 1499,
        category: 'tshirts',
        images: ['/stylesync_tee.png'],
        description: 'The perfectly tailored white t-shirt by StyleSync.',
        rating: 4.8,
        numReviews: 85,
        tags: ['casual', 'summer', 'stylesync'],
        countInStock: 500,
        user: adminUser,
      },
      {
        title: 'Classic White T-Shirt',
        price: 999,
        category: 'tshirts',
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80'],
        description: 'A timeless classic white t-shirt.',
        rating: 4.5,
        numReviews: 12,
        tags: ['casual', 'summer'],
        countInStock: 50,
        user: adminUser,
      },
      {
        title: 'Slim Fit Blue Jeans',
        price: 2499,
        category: 'jeans',
        images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80'],
        description: 'Comfortable slim fit jeans.',
        rating: 4.8,
        numReviews: 24,
        tags: ['casual'],
        countInStock: 30,
        user: adminUser,
      },
      {
        title: 'Elegant Silk Saree',
        price: 8999,
        category: 'ethnic',
        images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80'],
        description: 'A beautiful traditional pure silk saree.',
        rating: 4.9,
        numReviews: 45,
        tags: ['ethnic', 'traditional'],
        countInStock: 50,
        user: adminUser,
      }
    ];

    await Product.insertMany(sampleProducts);
    res.json({ message: 'Database seeded successfully with users and products!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getSellerProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  seedProducts
};
