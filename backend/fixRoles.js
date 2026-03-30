const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');

dotenv.config();

const ADMIN_EMAIL = 'rahuldhakarmm@gmail.com';

const enforceRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for role enforcement...');

    // 1. Downgrade all sellers except the chosen one
    const usersToDowngrade = await User.updateMany(
      { email: { $ne: ADMIN_EMAIL }, role: 'seller' },
      { $set: { role: 'buyer' } }
    );
    console.log(`Downgraded ${usersToDowngrade.modifiedCount} users to 'buyer' role.`);

    // 2. Ensure the admin has the 'seller' role
    const admin = await User.findOneAndUpdate(
      { email: ADMIN_EMAIL },
      { $set: { role: 'seller' } },
      { new: true }
    );
    
    if (admin) {
      console.log(`Verified ${ADMIN_EMAIL} is now a seller.`);
    } else {
      console.log(`WARNING: Admin user ${ADMIN_EMAIL} not found in database!`);
    }

    // 3. Remove products not belonging to the admin
    // Note: If admin exists, only keep their products.
    if (admin) {
        const deletedProducts = await Product.deleteMany({ user: { $ne: admin._id } });
        console.log(`Deleted ${deletedProducts.deletedCount} unauthorized products.`);
    }

    console.log('Role enforcement completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error during role enforcement:', error.message);
    process.exit(1);
  }
};

enforceRoles();
