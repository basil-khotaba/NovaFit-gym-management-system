const multer = require('multer');
const path = require('path');
const AppError = require('../utils/AppError');

/**
 * Multer upload middleware.
 *
 * Multer handles multipart/form-data requests — the format used to
 * send files. It saves the uploaded file to the uploads/ folder and
 * puts its details on req.file for the controller to use.
 */

/**
 * Storage config — where files go and what they are named.
 */
const storage = multer.diskStorage({
  // Which folder to save into.
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  // What to name the file. We build a unique name so two uploads
  // never overwrite each other: a timestamp + random number + the
  // original file extension (.jpg, .png, etc.).
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

/**
 * File filter — only allow image files through.
 */
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true); // accept the file
  } else {
    // reject it with a clear error
    cb(new AppError('Only JPEG, PNG, and WebP images are allowed', 400), false);
  }
};

/**
 * The configured Multer instance.
 * - storage:    use the disk storage defined above
 * - fileFilter: only images
 * - limits:     max file size 5 MB
 */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = upload;