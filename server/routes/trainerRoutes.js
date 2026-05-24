const express = require('express');
const router = express.Router();

const {
  getAllTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  uploadTrainerPhoto,
} = require('../controllers/trainerController');

const { protect, restrictTo } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  createTrainerSchema,
  updateTrainerSchema,
} = require('../validation/trainerValidation');

const upload = require('../middleware/upload');

router.get('/', getAllTrainers);
router.get('/:id', getTrainerById);

router.post('/', protect, restrictTo('admin'), validate(createTrainerSchema), createTrainer);
router.put('/:id', protect, restrictTo('admin'), validate(updateTrainerSchema), updateTrainer);
router.delete('/:id', protect, restrictTo('admin'), deleteTrainer);

// Upload a trainer photo (admin only).
// upload.single('photo') tells Multer to expect ONE file in a
// form-data field named "photo".
router.patch(
  '/:id/photo',
  protect,
  restrictTo('admin'),
  upload.single('photo'),
  uploadTrainerPhoto
);

module.exports = router;