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

/**
 * Trainer routes — mounted at /api/trainers in app.js.
 *
 * Reading trainers is public; creating, editing, and deleting them
 * is restricted to admins.
 */

// GET /api/trainers — list all trainers (public)
router.get('/', getAllTrainers);
// GET /api/trainers/:id — single trainer details, with their classes (public)
router.get('/:id', getTrainerById);

// POST /api/trainers — create a trainer (admin only)
router.post('/', protect, restrictTo('admin'), validate(createTrainerSchema), createTrainer);
// PUT /api/trainers/:id — update a trainer (admin only)
router.put('/:id', protect, restrictTo('admin'), validate(updateTrainerSchema), updateTrainer);
// DELETE /api/trainers/:id — remove a trainer (admin only)
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