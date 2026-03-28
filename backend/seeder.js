const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const bcrypt = require('bcryptjs');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const importData = async () => {
  try {
    await Order.deleteMany();
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
        category: 'tshirts',
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
        category: 'tshirts',
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
        category: 'tshirts',
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
        category: 'shirts',
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
        category: 'ethnic',
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
        category: 'jeans',
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
        category: 'ethnic',
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
        category: 'shoes',
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
        category: 'ethnic',
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
        category: 'accessories',
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
        category: 'jeans',
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
        category: 'accessories',
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
        category: 'shoes',
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
        category: 'accessories',
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
        category: 'shirts',
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
        category: 'shirts',
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
        category: 'accessories',
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
    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
