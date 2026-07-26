import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Each page is its own chunk, fetched only when its route is visited —
// keeps the initial bundle small instead of shipping every page upfront.
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Classes = lazy(() => import('./pages/Classes'));
const ClassDetail = lazy(() => import('./pages/ClassDetail'));
const Trainers = lazy(() => import('./pages/Trainers'));
const Memberships = lazy(() => import('./pages/Memberships'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ClassForm = lazy(() => import('./pages/ClassForm'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/classes/:id" element={<ClassDetail />} />
          <Route path="/trainers" element={<Trainers />} />
          <Route path="/memberships" element={<Memberships />} />
          <Route
            path="/my-bookings"
            element={
              <PrivateRoute>
                <MyBookings />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/classes/new"
            element={
              <AdminRoute>
                <ClassForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/classes/:id/edit"
            element={
              <AdminRoute>
                <ClassForm />
              </AdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;