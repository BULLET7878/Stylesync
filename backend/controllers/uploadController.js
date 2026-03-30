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

// GET /api/upload/image/:id – Serve legacy GridFS images or clean placeholder
const serveImage = async (req, res) => {
  // Helper: send a clean "no image" SVG placeholder
  const sendPlaceholder = () => {
    res.set('Content-Type', 'image/svg+xml');
    res.send(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="400" height="400" fill="#f3f4f6"/>
        <rect x="140" y="130" width="120" height="100" rx="8" fill="#d1d5db"/>
        <circle cx="165" cy="158" r="16" fill="#9ca3af"/>
        <path d="M140 220 l50-50 30 30 30-40 50 60z" fill="#9ca3af"/>
        <text x="200" y="270" font-family="sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle">No Image</text>
      </svg>
    `);
  };

  try {
    const gfs = req.app.get('gfs');
    if (!gfs) return sendPlaceholder();

    const { id } = req.params;
    const mongoose = require('mongoose');

    if (!mongoose.Types.ObjectId.isValid(id)) return sendPlaceholder();

    const _id = new mongoose.Types.ObjectId(id);
    const files = await gfs.find({ _id }).toArray();

    if (!files || files.length === 0) return sendPlaceholder();

    res.set('Content-Type', files[0].contentType || 'image/jpeg');
    const downloadStream = gfs.openDownloadStream(_id);
    downloadStream.pipe(res);
    downloadStream.on('error', () => sendPlaceholder());

  } catch (error) {
    console.error('GridFS serve error:', error);
    sendPlaceholder();
  }
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
