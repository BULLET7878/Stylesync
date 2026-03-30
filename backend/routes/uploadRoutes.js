const express = require('express');
const router = express.Router();
const { upload, uploadImage, serveImage, deleteImage } = require('../controllers/uploadController');
const { protect, seller } = require('../middleware/authMiddleware');

// POST  /api/upload          — upload & store image in GridFS (sellers only)
router.post('/', protect, seller, upload.single('image'), uploadImage);

// GET   /api/upload/image/:id — serve image from GridFS (public)
router.get('/image/:id', serveImage);

// DELETE /api/upload/image/:id — remove image from GridFS (sellers only)
router.delete('/image/:id', protect, seller, deleteImage);

module.exports = router;
