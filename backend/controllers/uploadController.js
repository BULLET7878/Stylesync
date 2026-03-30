const multer = require('multer');
const sharp = require('sharp');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { Readable } = require('stream');

// Use memory storage – we process with sharp first, then stream to GridFS
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(require('path').extname(file.originalname).toLowerCase());
  const mimetype = /image\/(jpeg|jpg|png|webp)/.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Images only! (jpg, jpeg, png, webp)'));
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => checkFileType(file, cb),
});

// Helper: get (or create) the GridFSBucket
const getBucket = () => {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database not connected');
  return new GridFSBucket(db, { bucketName: 'productImages' });
};

// POST /api/upload  – compress with sharp → store in GridFS → return URL
const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  try {
    // Compress & convert to WebP
    const webpBuffer = await sharp(req.file.buffer)
      .resize(800, 1000, { fit: 'cover', position: 'center' })
      .toFormat('webp')
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    const bucket = getBucket();
    const filename = `product-${Date.now()}.webp`;

    // Upload to GridFS using a readable stream
    const readableStream = Readable.from(webpBuffer);
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: 'image/webp',
    });

    await new Promise((resolve, reject) => {
      readableStream.pipe(uploadStream)
        .on('finish', resolve)
        .on('error', reject);
    });

    const fileId = uploadStream.id.toString();
    const imageUrl = `/api/upload/image/${fileId}`;

    res.json({ imageUrl });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/upload/image/:id  – stream image from GridFS to client
const serveImage = async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const fileId = new ObjectId(req.params.id);
    const bucket = getBucket();

    // Find file metadata to check it exists & set content-type
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Cache headers – images don't change, cache aggressively
    res.set('Content-Type', files[0].contentType || 'image/webp');
    res.set('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
    res.set('ETag', files[0]._id.toString());

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
    downloadStream.on('error', () => res.status(404).json({ message: 'Image stream error' }));
  } catch (error) {
    console.error('Image serve error:', error);
    res.status(500).json({ message: 'Invalid image ID or server error' });
  }
};

// DELETE /api/upload/image/:id  – remove from GridFS (used on product delete)
const deleteImage = async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const fileId = new ObjectId(req.params.id);
    const bucket = getBucket();
    await bucket.delete(fileId);
    res.json({ message: 'Image deleted' });
  } catch (error) {
    console.error('Image delete error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { upload, uploadImage, serveImage, deleteImage };
