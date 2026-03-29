const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No image uploaded' });
  }

  const filename = `product-${Date.now()}.jpg`;
  const uploadDir = path.join(__dirname, '../uploads');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  try {
    const buffer = await sharp(req.file.buffer)
      .resize(800, 1000, {
        fit: 'cover',
        position: 'center',
      })
      .toFormat('jpeg')
      .jpeg({ quality: 80 })
      .toBuffer();

    const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    res.send(base64Image);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { upload, uploadImage };
