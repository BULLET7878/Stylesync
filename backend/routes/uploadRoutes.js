const express = require('express');
const router = express.Router();
const { upload, uploadImage } = require('../controllers/uploadController');
const { protect, seller } = require('../middleware/authMiddleware');

router.post('/', protect, seller, upload.single('image'), uploadImage);

module.exports = router;
