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

// GET /api/upload/image/:id – Serve legacy GridFS images or show fallback
const serveImage = async (req, res) => {
  try {
    const gfs = req.app.get('gfs');
    if (!gfs) throw new Error('GridFS not initialized');

    const { id } = req.params;
    const mongoose = require('mongoose');
    
    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.redirect('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop');
    }

    const _id = new mongoose.Types.ObjectId(id);
    
    // Check if file exists in GridFS
    const files = await gfs.find({ _id }).toArray();
    if (!files || files.length === 0) {
      // If not found in GridFS, fallback to professional placeholder
      return res.redirect('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop');
    }

    // Set correct content type for images
    res.set('Content-Type', files[0].contentType || 'image/jpeg');
    
    // Stream image from GridFS to response
    const downloadStream = gfs.openDownloadStream(_id);
    downloadStream.pipe(res);
    
    downloadStream.on('error', () => {
      res.redirect('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop');
    });

  } catch (error) {
    console.error('GridFS serve error:', error);
    res.redirect('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop');
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
