const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Coupon = require('./models/Coupon');
const User = require('./models/User');

dotenv.config();

const cleanupData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for cleanup...');

    // Delete all products, orders, and coupons
    const productDeleted = await Product.deleteMany({});
    const orderDeleted = await Order.deleteMany({});
    const couponDeleted = await Coupon.deleteMany({});
    
    console.log(`Deleted ${productDeleted.deletedCount} products`);
    console.log(`Deleted ${orderDeleted.deletedCount} orders`);
    console.log(`Deleted ${couponDeleted.deletedCount} coupons`);

    // Optionally: check if the owner exists, if not, print a warning
    const owner = await User.findOne({ email: 'rahuldhakarmm@gmail.com' });
    if (!owner) {
      console.log('WARNING: Owner account (rahuldhakarmm@gmail.com) not found. You may need to register it.');
    } else {
      console.log('Owner account preserved.');
    }

    console.log('Cleanup completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error during cleanup:', error.message);
    process.exit(1);
  }
};

cleanupData();
