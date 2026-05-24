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

router.get('/', getAllPlans);
router.get('/:id', getPlanById);

router.post('/', protect, restrictTo('admin'), validate(createPlanSchema), createPlan);
router.put('/:id', protect, restrictTo('admin'), validate(updatePlanSchema), updatePlan);
router.delete('/:id', protect, restrictTo('admin'), deletePlan);

module.exports = router;