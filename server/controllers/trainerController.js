const Trainer = require('../models/Trainer');
const AppError = require('../utils/AppError');

/**
 * Trainer controller — CRUD logic for trainers.
 */

// GET /api/trainers — public
exports.getAllTrainers = async (req, res, next) => {
  try {
    const trainers = await Trainer.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: trainers.length, data: trainers });
  } catch (error) {
    next(error);
  }
};

// GET /api/trainers/:id — public
exports.getTrainerById = async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id).populate('classes');
    if (!trainer) {
      return next(new AppError('Trainer not found', 404));
    }
    res.status(200).json({ success: true, data: trainer });
  } catch (error) {
    next(error);
  }
};

// POST /api/trainers — admin only
exports.createTrainer = async (req, res, next) => {
  try {
    const trainer = await Trainer.create(req.body);
    res.status(201).json({ success: true, data: trainer });
  } catch (error) {
    next(error);
  }
};

// PUT /api/trainers/:id — admin only
exports.updateTrainer = async (req, res, next) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!trainer) {
      return next(new AppError('Trainer not found', 404));
    }
    res.status(200).json({ success: true, data: trainer });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/trainers/:id — admin only
exports.deleteTrainer = async (req, res, next) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);
    if (!trainer) {
      return next(new AppError('Trainer not found', 404));
    }
    res.status(200).json({ success: true, message: 'Trainer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload (or replace) a trainer's photo.
 * Route:  PATCH /api/trainers/:id/photo
 * Access: Admin only
 *
 * Multer runs before this and puts the saved file on req.file.
 * We store the file's public path on the trainer's "photo" field.
 */
exports.uploadTrainerPhoto = async (req, res, next) => {
  try {
    // If Multer didn't attach a file, no image was sent.
    if (!req.file) {
      return next(new AppError('Please upload an image file', 400));
    }

    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return next(new AppError('Trainer not found', 404));
    }

    // Save the public path (e.g. "/uploads/photo-12345.jpg").
    // The file itself is on disk; the database just stores the path.
    trainer.photo = `/uploads/${req.file.filename}`;
    await trainer.save();

    res.status(200).json({ success: true, data: trainer });
  } catch (error) {
    next(error);
  }
};