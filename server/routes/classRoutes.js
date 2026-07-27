const express = require('express');
const router = express.Router();

const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  uploadClassImage,
} = require('../controllers/classController');

const { protect, restrictTo } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  createClassSchema,
  updateClassSchema,
} = require('../validation/classValidation');

const upload = require('../middleware/upload');

/**
 * Class routes — mounted at /api/classes in app.js.
 *
 * Reading classes is public; creating, editing, and deleting them
 * is restricted to admins.
 */

// GET /api/classes — list all classes (public, supports ?category=)
router.get('/', getAllClasses);
// GET /api/classes/:id — single class details (public)
router.get('/:id', getClassById);

// POST /api/classes — create a class (admin only)
router.post('/', protect, restrictTo('admin'), validate(createClassSchema), createClass);
// PUT /api/classes/:id — update a class (admin only)
router.put('/:id', protect, restrictTo('admin'), validate(updateClassSchema), updateClass);
// DELETE /api/classes/:id — remove a class (admin only)
router.delete('/:id', protect, restrictTo('admin'), deleteClass);

// Upload a class image (admin only).
router.patch(
  '/:id/image',
  protect,
  restrictTo('admin'),
  upload.single('image'),
  uploadClassImage
);

module.exports = router;