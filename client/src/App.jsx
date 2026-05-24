import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Classes from './pages/Classes';
import ClassDetail from './pages/ClassDetail';
import Trainers from './pages/Trainers';
import Memberships from './pages/Memberships';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import ClassForm from './pages/ClassForm';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <Navbar />
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
    </>
  );
}

export default App;