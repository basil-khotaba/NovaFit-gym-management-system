const Plan = require('../models/Plan');
const AppError = require('../utils/AppError');

/**
 * Plan controller — CRUD logic for membership plans.
 */

// GET /api/plans — public
exports.getAllPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    next(error);
  }
};

// GET /api/plans/:id — public
exports.getPlanById = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return next(new AppError('Plan not found', 404));
    }
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// POST /api/plans — admin only
exports.createPlan = async (req, res, next) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// PUT /api/plans/:id — admin only
exports.updatePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!plan) {
      return next(new AppError('Plan not found', 404));
    }
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/plans/:id — admin only
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return next(new AppError('Plan not found', 404));
    }
    res.status(200).json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    next(error);
  }
};