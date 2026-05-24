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

router.get('/', getAllClasses);
router.get('/:id', getClassById);

router.post('/', protect, restrictTo('admin'), validate(createClassSchema), createClass);
router.put('/:id', protect, restrictTo('admin'), validate(updateClassSchema), updateClass);
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