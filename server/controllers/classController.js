const Class = require('../models/Class');
const Trainer = require('../models/Trainer');
const AppError = require('../utils/AppError');

/**
 * Class controller — CRUD logic for gym classes.
 */

// GET /api/classes — public. Supports ?category=Yoga
exports.getAllClasses = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const classes = await Class.find(filter)
      .sort({ createdAt: -1 })
      .populate('trainer', 'name specialties photo rating');
    res.status(200).json({ success: true, count: classes.length, data: classes });
  } catch (error) {
    next(error);
  }
};

// GET /api/classes/:id — public
exports.getClassById = async (req, res, next) => {
  try {
    const gymClass = await Class.findById(req.params.id).populate(
      'trainer',
      'name specialties photo rating bio'
    );
    if (!gymClass) {
      return next(new AppError('Class not found', 404));
    }
    res.status(200).json({ success: true, data: gymClass });
  } catch (error) {
    next(error);
  }
};

// POST /api/classes — admin only
exports.createClass = async (req, res, next) => {
  try {
    const trainerExists = await Trainer.findById(req.body.trainer);
    if (!trainerExists) {
      return next(new AppError('No trainer found with that id', 404));
    }
    const gymClass = await Class.create(req.body);
    res.status(201).json({ success: true, data: gymClass });
  } catch (error) {
    next(error);
  }
};

// PUT /api/classes/:id — admin only
exports.updateClass = async (req, res, next) => {
  try {
    if (req.body.trainer) {
      const trainerExists = await Trainer.findById(req.body.trainer);
      if (!trainerExists) {
        return next(new AppError('No trainer found with that id', 404));
      }
    }
    const gymClass = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!gymClass) {
      return next(new AppError('Class not found', 404));
    }
    res.status(200).json({ success: true, data: gymClass });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/classes/:id — admin only
exports.deleteClass = async (req, res, next) => {
  try {
    const gymClass = await Class.findByIdAndDelete(req.params.id);
    if (!gymClass) {
      return next(new AppError('Class not found', 404));
    }
    res.status(200).json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload (or replace) a class image.
 * Route:  PATCH /api/classes/:id/image
 * Access: Admin only
 */
exports.uploadClassImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload an image file', 400));
    }

    const gymClass = await Class.findById(req.params.id);
    if (!gymClass) {
      return next(new AppError('Class not found', 404));
    }

    gymClass.image = `/uploads/${req.file.filename}`;
    await gymClass.save();

    res.status(200).json({ success: true, data: gymClass });
  } catch (error) {
    next(error);
  }
};