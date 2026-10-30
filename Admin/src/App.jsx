import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Orders from './pages/Orders';
import ManageProperties from './pages/ManageProperties';
import Categories from './pages/Categories';
import Marketing from './pages/Marketing';
import Customers from './pages/Customers';
import Reviews from './pages/Reviews';
import Coupons from './pages/Coupons';
import Favorites from './pages/Favorites';
import Inquiries from './pages/Inquiries';
import LiveChat from './pages/LiveChat';
import Reports from './pages/Reports';
import SubAdmins from './pages/SubAdmins';
import AddProperty from './pages/AddProperty';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SellerRequests from './pages/SellerRequests';
import SiteVisits from './pages/SiteVisits';
import KycVerification from './pages/KycVerification';
import Payouts from './pages/Payouts';
import PropertyReports from './pages/PropertyReports';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const RoleRoute = ({ children, allowedRoles, requiredPermission, fallbackPath = "/" }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const role = user.role || 'Sub-Admin';
  const isSuperOrMain = role === 'Super Admin' || role === 'Main Admin' || role === 'Admin';
  if (isSuperOrMain) return children;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (requiredPermission && !user.accessPermissions?.[requiredPermission]) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="orders" element={<Orders />} />
        <Route path="bookings" element={<Orders />} />
        <Route path="products" element={<ManageProperties />} />
        <Route path="properties" element={<ManageProperties />} />
        <Route path="categories" element={<Categories />} />
        <Route path="marketing" element={<Marketing />} />
        <Route path="customers" element={<Customers />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="offers" element={<Coupons />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="messages" element={<LiveChat />} />
        <Route path="live-chat" element={<LiveChat />} />
        <Route path="inquiries" element={<Inquiries />} />
        <Route path="reports" element={<Reports />} />
        <Route path="property-reports" element={<PropertyReports />} />
        <Route path="listing-reports" element={<PropertyReports />} />
        <Route path="sub-admins" element={<SubAdmins />} />
        <Route path="users" element={<SubAdmins />} />
        <Route path="kyc-verification" element={<KycVerification />} />
        <Route path="kyc" element={<KycVerification />} />
        <Route path="payouts" element={<Payouts />} />
        <Route path="bank-details" element={<Payouts />} />
        <Route path="add-property" element={<AddProperty />} />
        <Route path="edit-property/:id" element={<AddProperty isEdit={true} />} />
        <Route path="seller-requests" element={<SellerRequests />} />
        <Route path="site-visits" element={<SiteVisits />} />
        <Route path="visits" element={<SiteVisits />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
