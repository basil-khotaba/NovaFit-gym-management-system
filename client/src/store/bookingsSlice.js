import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

/**
 * Redux slice for the logged-in member's bookings.
 *
 * This is the one piece of app state that genuinely benefits from a
 * central store: a booking made from ClassDetail has to show up on
 * MyBookings (and vice versa) without either page knowing about the
 * other or re-fetching from the server.
 */

export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/bookings/my');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Could not load bookings'
      );
    }
  }
);

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (classId, { rejectWithValue }) => {
    try {
      const res = await api.post('/bookings', { class: classId });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Booking failed.'
      );
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async (bookingId, { rejectWithValue }) => {
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      return bookingId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Could not cancel booking.'
      );
    }
  }
);

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  cancellingId: null,
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchMyBookings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // create — the booking returned may be a brand-new document, or a
      // previously-cancelled one that the server reactivated.
      .addCase(createBooking.fulfilled, (state, action) => {
        const booking = action.payload;
        const idx = state.items.findIndex((b) => b._id === booking._id);
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...booking };
        } else {
          state.items.unshift(booking);
        }
      })

      // cancel
      .addCase(cancelBooking.pending, (state, action) => {
        state.cancellingId = action.meta.arg;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const bookingId = action.payload;
        const booking = state.items.find((b) => b._id === bookingId);
        if (booking) booking.status = 'cancelled';
        state.cancellingId = null;
      })
      .addCase(cancelBooking.rejected, (state) => {
        state.cancellingId = null;
      });
  },
});

export default bookingsSlice.reducer;
