const Booking = require('../models/Booking');
const Class = require('../models/Class');
const AppError = require('../utils/AppError');

/**
 * Booking controller.
 *
 * Handles members booking and cancelling places in classes.
 */

/**
 * Get the logged-in user's own bookings.
 * Route:  GET /api/bookings/my
 * Access: Protected (any logged-in user)
 */
exports.getMyBookings = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware.
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      // Pull in class details, and the class's trainer name too.
      .populate({
        path: 'class',
        select: 'name category schedule durationMinutes',
        populate: { path: 'trainer', select: 'name' },
      });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookings (admin overview).
 * Route:  GET /api/bookings
 * Access: Admin only
 */
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: 'name email membership',
        populate: { path: 'membership', populate: { path: 'plan', select: 'name' } },
      })
      .populate('class', 'name category schedule');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Book a place in a class.
 * Route:  POST /api/bookings
 * Access: Protected (any logged-in user)
 */
exports.createBooking = async (req, res, next) => {
  try {
    const classId = req.body.class;
    const userId = req.user._id;

    // 1. The class must exist.
    const gymClass = await Class.findById(classId);
    if (!gymClass) {
      return next(new AppError('No class found with that id', 404));
    }

    // 1b. Check the user's plan class limit for this month.
    const User = require('../models/User');
    const userDoc = await User.findById(userId).populate({
      path: 'membership',
      populate: { path: 'plan', select: 'name classLimit' },
    });

    const plan = userDoc?.membership?.plan;
    if (!plan) {
      return next(new AppError('You need an active membership plan to book classes. Visit the Memberships page to get started.', 403));
    }

    if (plan.classLimit !== null && plan.classLimit !== undefined) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const bookedThisMonth = await Booking.countDocuments({
        user: userId,
        status: 'confirmed',
        createdAt: { $gte: startOfMonth },
      });

      if (bookedThisMonth >= plan.classLimit) {
        return next(new AppError(
          `You've reached your ${plan.name} plan limit of ${plan.classLimit} classes this month. Upgrade your plan for more classes.`,
          403
        ));
      }
    }

    // 2. Count how many confirmed bookings the class already has.
    const confirmedCount = await Booking.countDocuments({
      class: classId,
      status: 'confirmed',
    });
    if (confirmedCount >= gymClass.capacity) {
      return next(new AppError('This class is already full', 400));
    }

    // 3. Has this user booked this class before?
    //    (There can only ever be one such document — see the compound
    //     unique index on the Booking model.)
    const existing = await Booking.findOne({ class: classId, user: userId });

    if (existing) {
      if (existing.status === 'confirmed') {
        // Already actively booked — block the duplicate.
        return next(new AppError('You have already booked this class', 400));
      }
      // It was cancelled before — reactivate it instead of making a new one.
      existing.status = 'confirmed';
      existing.bookedAt = Date.now();
      await existing.save();
      return res.status(200).json({ success: true, data: existing });
    }

    // 4. No prior booking — create a fresh one.
    const booking = await Booking.create({ class: classId, user: userId });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel one of the user's own bookings.
 * Route:  PATCH /api/bookings/:id/cancel
 * Access: Protected (any logged-in user)
 */
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // A user may cancel only their OWN bookings.
    // .toString() compares the two ObjectIds as plain strings.
    if (booking.user.toString() !== req.user._id.toString()) {
      return next(
        new AppError('You can only cancel your own bookings', 403)
      );
    }

    if (booking.status === 'cancelled') {
      return next(new AppError('This booking is already cancelled', 400));
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};