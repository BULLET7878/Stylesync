const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const Product = require('./models/Product');

async function removeDummyData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {});
    console.log('MongoDB Connected');
    
    // Find all products to see what we're working with
    const allProducts = await Product.find({});
    console.log(`Total products current: ${allProducts.length}`);

    // Delete products that contain unsplash in their image arrays or image string
    const result = await Product.deleteMany({
      $or: [
        { image: { $regex: 'unsplash.com', $options: 'i' } },
        { images: { $regex: 'unsplash.com', $options: 'i' } },
        { title: { $regex: 'dummy', $options: 'i' } }
      ]
    });

    console.log(`Deleted ${result.deletedCount} dummy products that were using Unsplash stock images.`);

    const remainingProducts = await Product.find({});
    console.log(`Products remaining: ${remainingProducts.length}`);

  } catch (err) {
    console.error('Error removing dummy data:', err);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

removeDummyData();
