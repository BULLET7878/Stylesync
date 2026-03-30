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

    const category = req.query.category 
      ? { category: { $regex: new RegExp(`^${req.query.category}$`, 'i') } } 
      : {};
    
    const priceFilter = {};
    if (req.query.minPrice && req.query.minPrice.trim() !== '') {
      const min = Number(req.query.minPrice);
      if (!Number.isNaN(min)) priceFilter.$gte = min;
    }
    if (req.query.maxPrice && req.query.maxPrice.trim() !== '') {
      const max = Number(req.query.maxPrice);
      if (!Number.isNaN(max)) priceFilter.$lte = max;
    }
    const finalPriceFilter = Object.keys(priceFilter).length > 0 ? { price: priceFilter } : {};

    // Rating Filter - Hardened dynamic builder
    const ratingFilter = {};
    if (req.query.rating && req.query.rating.trim() !== '') {
      const r = Number(req.query.rating);
      if (!Number.isNaN(r)) {
        ratingFilter.rating = { $gte: r };
      }
    }

    let sortBy = { createdAt: -1 }; // Default: New Arrivals
    if (req.query.sort === 'price_asc') sortBy = { price: 1 };
    else if (req.query.sort === 'price_desc') sortBy = { price: -1 };
    else if (req.query.sort === 'popularity') sortBy = { rating: -1, numReviews: -1 };

    const products = await Product.find({ ...keyword, ...category, ...finalPriceFilter, ...ratingFilter })
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
    const products = await Product.find({ user: req.user._id }).populate('user', 'name email');
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
    const jwt = require('jsonwebtoken');

    if (product) {
      product.views = (product.views || 0) + 1;
      await product.save();
      
      const productObj = product.toObject();
      
      // Manual auth check for public route to detect ownership
      let currentUser = null;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
          const token = req.headers.authorization.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          currentUser = decoded.id || decoded._id;
        } catch (e) {
          // Ignore invalid tokens for public route
        }
      }

      if (currentUser) {
        productObj.isOwner = product.user._id.toString() === currentUser.toString() || (req.user && req.user.role === 'admin');
        
        // Check if user has purchased and received this product to allow reviews
        const Order = require('../models/Order');
        const hasDelivered = await Order.findOne({
          user: currentUser,
          status: 'Delivered',
          'orderItems.product': req.params.id
        });
        productObj.canReview = !!hasDelivered;
      }
      
      res.json(productObj);
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
    console.log('--- CREATE PRODUCT ---');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('User Role:', req.user.role);

    try {
      const {
      title,
      price,
      discountPrice,
      description,
      images,
      category,
      countInStock,
      tags
    } = req.body;

    const product = new Product({
      title,
      price,
      discountPrice: discountPrice || 0,
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
      discountPrice,
      description,
      images,
      category,
      countInStock,
      tags
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      const isOwner = product.user.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Not authorized: You do not own this product' });
      }
      product.title = title || product.title;
      product.price = price || product.price;
      product.discountPrice = discountPrice !== undefined ? discountPrice : product.discountPrice;
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
      const isOwner = product.user.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Not authorized: You do not own this product' });
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
    const Order = require('../models/Order');

    const product = await Product.findById(req.params.id);

    if (product) {
      // 1. Check if user already reviewed
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      // 2. Check if user has purchased and received this product
      const hasPurchased = await Order.findOne({
        user: req.user._id,
        status: 'Delivered',
        'orderItems.product': req.params.id
      });

      if (!hasPurchased) {
        return res.status(403).json({ message: 'You can only review products you have purchased and received.' });
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
    const sellerUser = createdUsers[2]._id;

    const sampleProducts = [
      {
        title: 'StyleSync Signature Black Hoodie',
        price: 3999,
        category: 'T-Shirts',
        images: ['/stylesync_hoodie.png'],
        description: 'Our premium signature black hoodie featuring a subtle elegant chest logo. Heavyweight cotton blend with a tailored fit.',
        rating: 5,
        numReviews: 120,
        tags: ['casual', 'premium', 'stylesync', 'essential', 'winter'],
        countInStock: 200,
        user: adminUser,
      },
      {
        title: 'StyleSync Classic White Tee',
        price: 1499,
        category: 'T-Shirts',
        images: ['/stylesync_tee.png'],
        description: 'The perfectly tailored white t-shirt. Designed by StyleSync for ultimate comfort and fit. 100% Supima cotton.',
        rating: 4.8,
        numReviews: 85,
        tags: ['casual', 'summer', 'stylesync', 'essential', 'minimalist'],
        countInStock: 500,
        user: adminUser,
      },
      {
        title: 'Oversized Acid Wash Tee',
        price: 1899,
        category: 'T-Shirts',
        images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80'],
        description: 'Vintage-inspired acid wash t-shirt with a modern oversized silhouette. Perfect for streetwear layering.',
        rating: 4.7,
        numReviews: 28,
        tags: ['streetwear', 'casual', 'vintage', 'acid-wash'],
        countInStock: 45,
        user: sellerUser,
      },
      {
        title: 'Slim Fit Charcoal Work Suit',
        price: 12999,
        category: 'Shirts',
        images: ['https://images.unsplash.com/photo-1594932224491-36423ca0b13b?auto=format&fit=crop&q=80'],
        description: 'Expertly tailored charcoal suit made from Italian wool. Features a modern slim fit and premium satin lining.',
        rating: 5.0,
        numReviews: 15,
        tags: ['formal', 'business', 'premium', 'tailored'],
        countInStock: 12,
        user: adminUser,
      },
      {
        title: 'Chikankari Hand-Embroidered Kurta',
        price: 4499,
        category: 'Ethnic Wear',
        images: ['https://images.unsplash.com/photo-1624314138470-5a2f24623f10?auto=format&fit=crop&q=80'],
        description: 'Authentic Lucknawi Chikankari kurta on premium georgette. Hand-crafted by master artisans with delicate thread work.',
        rating: 4.9,
        numReviews: 34,
        tags: ['ethnic', 'traditional', 'handcrafted', 'festive'],
        countInStock: 20,
        user: sellerUser,
      },
      {
        title: 'Tech-Utility Cargo Joggers',
        price: 2999,
        category: 'Jeans',
        images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80'],
        description: 'Water-resistant techwear joggers with multiple utility pockets and adjustable ankle straps for a modern look.',
        rating: 4.6,
        numReviews: 19,
        tags: ['streetwear', 'techwear', 'utility', 'cargo'],
        countInStock: 55,
        user: sellerUser,
      },
      {
        title: 'Luxe Crimson Evening Gown',
        price: 7999,
        category: 'Ethnic Wear',
        images: ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80'],
        description: 'A breathtaking crimson red evening gown with floor-length silhouette and elegant back detailing.',
        rating: 4.8,
        numReviews: 22,
        tags: ['formal', 'party', 'luxury', 'evening-wear'],
        countInStock: 8,
        user: adminUser,
      },
      {
        title: 'Minimalist Leather Sneakers',
        price: 5499,
        category: 'Shoes',
        images: ['https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80'],
        description: 'Pristine white leather sneakers with a low-top profile. The ultimate versatile footwear for any wardrobe.',
        rating: 4.9,
        numReviews: 67,
        tags: ['minimalist', 'shoes', 'casual', 'premium'],
        countInStock: 120,
        user: adminUser,
      },
      {
        title: 'Bohemian Floral Maxi Skirt',
        price: 2299,
        category: 'Ethnic Wear',
        images: ['https://images.unsplash.com/photo-1582142306909-195724d33ffc?auto=format&fit=crop&q=80'],
        description: 'Flowy maxi skirt with a vibrant bohemian floral print and comfortable elastic waistband.',
        rating: 4.5,
        numReviews: 42,
        tags: ['boho', 'summer', 'floral', 'casual'],
        countInStock: 35,
        user: sellerUser,
      },
      {
        title: 'Handcrafted Silver Jhumkas',
        price: 1899,
        category: 'Accessories',
        images: ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80'],
        description: 'Stunning oxidized silver jhumka earrings with intricate tribal carvings and tiny pearl bells.',
        rating: 4.8,
        numReviews: 95,
        tags: ['accessories', 'ethnic', 'handcrafted', 'jewelry'],
        countInStock: 150,
        user: sellerUser,
      },
      {
        title: 'Active-Poly Performance Shorts',
        price: 1299,
        category: 'Jeans',
        images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80'],
        description: 'Quick-dry performance shorts with four-way stretch technology for high-intensity training.',
        rating: 4.7,
        numReviews: 56,
        tags: ['athleisure', 'performance', 'sport', 'gym'],
        countInStock: 80,
        user: adminUser,
      },
      {
        title: 'Silk Geometric Pattern Tie',
        price: 1899,
        category: 'Accessories',
        images: ['https://images.unsplash.com/photo-1589756823851-41a637330053?auto=format&fit=crop&q=80'],
        description: 'Narrow silk tie featuring a sophisticated geometric pattern in navy and silver.',
        rating: 4.9,
        numReviews: 18,
        tags: ['formal', 'accessories', 'business', 'silk'],
        countInStock: 40,
        user: sellerUser,
      },
      {
        title: 'Tan Leather Monk Strap Shoes',
        price: 6499,
        category: 'Shoes',
        images: ['https://images.unsplash.com/photo-1614252235316-c78d0937d2f2?auto=format&fit=crop&q=80'],
        description: 'Classic double monk strap shoes in burnished tan leather. Features a durable Goodyear-welted sole.',
        rating: 4.9,
        numReviews: 8,
        tags: ['formal', 'premium', 'leather', 'shoes'],
        countInStock: 15,
        user: adminUser,
      },
      {
        title: 'Eco-Friendly Hemp Tote',
        price: 1199,
        category: 'Accessories',
        images: ['https://images.unsplash.com/photo-1544816153-12ad5d7133a2?auto=format&fit=crop&q=80'],
        description: 'Sustainable tote bag made from high-quality hemp fibers. Durable, spacious, and perfect for daily errands.',
        rating: 4.6,
        numReviews: 31,
        tags: ['sustainable', 'accessories', 'eco-friendly', 'essential'],
        countInStock: 200,
        user: sellerUser,
      },
      {
        title: 'Cable Knit Cashmere Sweater',
        price: 5999,
        category: 'Shirts',
        images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80'],
        description: 'Ultra-soft cable knit sweater made from 100% Mongolian cashmere. Exceptional warmth and luxury.',
        rating: 5.0,
        numReviews: 12,
        tags: ['winter', 'luxury', 'premium', 'knitwear'],
        countInStock: 25,
        user: adminUser,
      },
      {
        title: 'Distressed Indigo Denim Jacket',
        price: 3499,
        category: 'Shirts',
        images: ['https://images.unsplash.com/photo-1551537482-f2035a38ee69?auto=format&fit=crop&q=80'],
        description: 'Classic denim jacket with custom distressing and antique copper hardware. Built to last.',
        rating: 4.7,
        numReviews: 45,
        tags: ['casual', 'denim', 'vintage', 'outerwear'],
        countInStock: 60,
        user: sellerUser,
      },
      {
        title: 'Minimalist Faux-Leather Wallet',
        price: 1299,
        category: 'Accessories',
        images: ['https://images.unsplash.com/photo-1627123430984-705199ee99d9?auto=format&fit=crop&q=80'],
        description: 'Sleek, slim-profile wallet made from high-quality vegan leather. RFID blocking technology included.',
        rating: 4.7,
        numReviews: 88,
        tags: ['accessories', 'essential', 'minimalist', 'gift'],
        countInStock: 100,
        user: sellerUser,
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
