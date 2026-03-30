const Coupon = require('../models/Coupon');

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: 'Coupon code has expired' });
    }

    res.json({
      _id: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed initial coupons (Dev tool)
// @route   GET /api/coupons/seed
// @access  Private/Admin
const seedCoupons = async (req, res) => {
  try {
    await Coupon.deleteMany();
    
    const coupons = [
      {
        code: 'OFF10',
        discountType: 'percentage',
        discountAmount: 10,
        expiryDate: new Date('2026-12-31'),
        active: true,
      },
      {
        code: 'WELCOME500',
        discountType: 'fixed',
        discountAmount: 500,
        expiryDate: new Date('2026-12-31'),
        active: true,
      },
      {
        code: 'STYLESYNC20',
        discountType: 'percentage',
        discountAmount: 20,
        expiryDate: new Date('2026-12-31'),
        active: true,
      }
    ];

    await Coupon.insertMany(coupons);
    res.json({ message: 'Coupons seeded successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  validateCoupon,
  seedCoupons,
};
