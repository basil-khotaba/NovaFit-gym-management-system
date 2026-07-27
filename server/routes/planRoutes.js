const express = require('express');
const router = express.Router();

const {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} = require('../controllers/planController');

const { protect, restrictTo } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  createPlanSchema,
  updatePlanSchema,
} = require('../validation/planValidation');

/**
 * Plan routes — mounted at /api/plans in app.js.
 *
 * Reading plans is public (needed for the pricing page); creating,
 * editing, and deleting them is restricted to admins.
 */

// GET /api/plans — list all plans (public)
router.get('/', getAllPlans);
// GET /api/plans/:id — single plan details (public)
router.get('/:id', getPlanById);

// POST /api/plans — create a plan (admin only)
router.post('/', protect, restrictTo('admin'), validate(createPlanSchema), createPlan);
// PUT /api/plans/:id — update a plan (admin only)
router.put('/:id', protect, restrictTo('admin'), validate(updatePlanSchema), updatePlan);
// DELETE /api/plans/:id — remove a plan (admin only)
router.delete('/:id', protect, restrictTo('admin'), deletePlan);

module.exports = router;