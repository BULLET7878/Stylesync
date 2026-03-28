const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log(`Connecting to: ${process.env.MONGODB_URI}`);
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('SUCCESS: Connected to MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error(`FAILURE: Could not connect to MongoDB. Error: ${err.message}`);
    process.exit(1);
  }
};

testConnection();
