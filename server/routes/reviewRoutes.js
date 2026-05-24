const express = require('express');
const router = express.Router();

const {
  getTrainerReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  createReviewSchema,
  updateReviewSchema,
} = require('../validation/reviewValidation');

// Public: all reviews for a given trainer.
router.get('/trainer/:trainerId', getTrainerReviews);

// Protected: any logged-in member can write a review.
router.post('/', protect, validate(createReviewSchema), createReview);

// Protected: edit / delete (ownership checked in the controller).
router.put('/:id', protect, validate(updateReviewSchema), updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;