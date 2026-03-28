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
        description: 'Our premium signature black hoodie featuring a subtle elegant chest logo. Heavyweight cotton blend.',
        rating: 5,
        numReviews: 120,
        tags: ['casual', 'premium', 'stylesync', 'essential'],
        countInStock: 200,
        user: adminUser,
      },
      {
        title: 'StyleSync Classic White Tee',
        price: 1499,
        category: 'tshirts',
        images: ['/stylesync_tee.png'],
        description: 'The perfectly tailored white t-shirt. Designed by StyleSync for ultimate comfort and fit.',
        rating: 4.8,
        numReviews: 85,
        tags: ['casual', 'summer', 'stylesync', 'essential'],
        countInStock: 500,
        user: adminUser,
      },
      {
        title: 'Classic White T-Shirt',
        price: 999,
        category: 'tshirts',
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80'],
        description: 'A timeless classic white t-shirt made from 100% organic cotton.',
        rating: 4.5,
        numReviews: 12,
        tags: ['casual', 'summer', 'essential'],
        countInStock: 50,
        user: adminUser,
      },
      {
        title: 'Slim Fit Blue Jeans',
        price: 2499,
        category: 'jeans',
        images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80'],
        description: 'Comfortable slim fit jeans perfect for any casual occasion.',
        rating: 4.8,
        numReviews: 24,
        tags: ['casual', 'essential'],
        countInStock: 30,
        user: adminUser,
      },
      {
        title: 'Leather Oxford Shoes',
        price: 4999,
        category: 'shoes',
        images: ['https://images.unsplash.com/photo-1614252235316-c78d0937d2f2?auto=format&fit=crop&q=80'],
        description: 'Premium leather oxford shoes for formal events.',
        rating: 4.9,
        numReviews: 8,
        tags: ['formal', 'premium'],
        countInStock: 15,
        user: adminUser,
      },
      {
        title: 'Summer Floral Dress',
        price: 1999,
        category: 'shirts',
        images: ['https://images.unsplash.com/photo-1572804013309-82a89141f2ff?auto=format&fit=crop&q=80'],
        description: 'Light and breezy summer dress.',
        rating: 4.6,
        numReviews: 18,
        tags: ['summer', 'casual'],
        countInStock: 25,
        user: adminUser,
      },
      {
        title: 'Black Running Sneakers',
        price: 3499,
        category: 'shoes',
        images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80'],
        description: 'High performance running sneakers.',
        rating: 4.7,
        numReviews: 32,
        tags: ['sport', 'casual'],
        countInStock: 40,
        user: adminUser,
      },
      {
        title: 'Classic Aviator Sunglasses',
        price: 899,
        category: 'accessories',
        images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80'],
        description: 'UV protection aviator sunglasses.',
        rating: 4.4,
        numReviews: 50,
        tags: ['summer', 'essential', 'casual'],
        countInStock: 100,
        user: adminUser,
      },
      {
        title: 'Elegant Silk Saree',
        price: 8999,
        category: 'ethnic',
        images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80'],
        description: 'A beautiful traditional pure silk saree with intricate golden zari work, perfect for festive occasions.',
        rating: 4.9,
        numReviews: 45,
        tags: ['ethnic', 'traditional', 'festive', 'saree'],
        countInStock: 50,
        user: adminUser,
      },
      {
        title: 'Premium Linen Kurta Set',
        price: 2999,
        category: 'ethnic',
        images: ['https://images.unsplash.com/photo-1596455607563-ad6193f76b11?auto=format&fit=crop&q=80'],
        description: 'Comfortable and stylish premium linen kurta pajama set for men.',
        rating: 4.7,
        numReviews: 32,
        tags: ['ethnic', 'traditional', 'kurta', 'mens'],
        countInStock: 80,
        user: adminUser,
      },
      {
        title: 'Gold Plated Traditional Jhumkas',
        price: 1499,
        category: 'accessories',
        images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80'],
        description: 'Exquisite traditional gold plated jhumka earrings with pearl drops.',
        rating: 4.8,
        numReviews: 120,
        tags: ['jewelry', 'accessories', 'traditional', 'ethnic'],
        countInStock: 150,
        user: adminUser,
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
