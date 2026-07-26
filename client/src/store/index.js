import { configureStore } from '@reduxjs/toolkit';
import bookingsReducer from './bookingsSlice';

/**
 * Central Redux store.
 *
 * Auth/user session lives in AuthContext (Context API) — it's simple,
 * read-mostly global state. Bookings live here because they're shared,
 * mutable data touched from two different pages (ClassDetail, MyBookings)
 * that otherwise have no relationship to each other.
 */
export const store = configureStore({
  reducer: {
    bookings: bookingsReducer,
  },
});
