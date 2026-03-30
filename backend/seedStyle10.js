const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Coupon = require('./models/Coupon');

dotenv.config();

const seedStyle10 = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for coupon seeding...');

    // 1. Remove existing STYLE10 if it exists
    await Coupon.deleteOne({ code: 'STYLE10' });

    // 2. Create the new STYLE10 coupon
    const coupon = await Coupon.create({
      code: 'STYLE10',
      discountType: 'percentage',
      discountAmount: 10,
      minOrderAmount: 1000,
      expiryDate: new Date('2026-12-31'),
      active: true,
    });

    console.log(`Successfully seeded coupon: ${coupon.code}`);
    process.exit();
  } catch (error) {
    console.error('Error during coupon seeding:', error.message);
    process.exit(1);
  }
};

seedStyle10();
