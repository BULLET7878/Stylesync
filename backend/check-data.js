const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const countProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await Product.countDocuments();
    console.log(`DATABASE_PRODUCT_COUNT: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

countProducts();
