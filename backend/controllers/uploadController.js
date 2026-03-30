const multer = require('multer');
const { storage, cloudinary } = require('../utils/cloudinaryConfig');

// Config: Use the Cloudinary storage engine
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// POST /api/upload  – store directly in Cloudinary → return secure URL
const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  try {
    // req.file is already uploaded to Cloudinary by multer-storage-cloudinary
    // It provides path (URL) and file details
    const imageUrl = req.file.path;

    res.json({ imageUrl });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/upload/image/:id – Fallback for legacy GridFS images
const serveImage = async (req, res) => {
  // Instead of an error, redirect to a professional StyleSync placeholder
  // This ensures your site always looks clean even with old product data
  res.redirect('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop');
};

// DELETE /api/upload/image/:id – remove from Cloudinary
const deleteImage = async (req, res) => {
  try {
    // Extract public_id from URL: StyleSync_Products/product-12345
    const parts = req.params.id.split('/');
    const publicId = parts[parts.length - 1].split('.')[0];
    const fullPublicId = `StyleSync_Products/${publicId}`;

    await cloudinary.uploader.destroy(fullPublicId);
    res.json({ message: 'Image deleted from Cloudinary' });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { upload, uploadImage, serveImage, deleteImage };
