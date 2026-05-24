const Review = require('../models/Review');
const Trainer = require('../models/Trainer');
const AppError = require('../utils/AppError');

/**
 * Review controller — members rate and comment on trainers.
 */

// GET /api/reviews/trainer/:trainerId — public
exports.getTrainerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ trainer: req.params.trainerId })
      .sort({ createdAt: -1 })
      .populate('user', 'name profileImage');
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

// POST /api/reviews — protected (members)
exports.createReview = async (req, res, next) => {
  try {
    // Confirm the trainer exists.
    const trainerExists = await Trainer.findById(req.body.trainer);
    if (!trainerExists) {
      return next(new AppError('No trainer found with that id', 404));
    }

    // One review per user per trainer (the model has a unique index).
    const existing = await Review.findOne({
      trainer: req.body.trainer,
      user: req.user._id,
    });
    if (existing) {
      return next(new AppError('You have already reviewed this trainer', 400));
    }

    const review = await Review.create({
      trainer: req.body.trainer,
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// PUT /api/reviews/:id — protected (own review only)
exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    // Only the review's author may edit it.
    if (review.user.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only edit your own review', 403));
    }

    if (req.body.rating !== undefined) review.rating = req.body.rating;
    if (req.body.comment !== undefined) review.comment = req.body.comment;
    await review.save();

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/reviews/:id — protected (own review, or admin)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    // The author can delete their own review; an admin can delete any.
    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return next(new AppError('You can only delete your own review', 403));
    }

    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};