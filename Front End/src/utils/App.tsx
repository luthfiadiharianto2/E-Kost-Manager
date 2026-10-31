import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '../contexts/AuthContext.tsx';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { AuthLoginPage } from '../pages/AuthLoginPage';
import { AuthSignupPage } from '../pages/AuthSignupPage';
import { AdminDashboard } from '../pages/AdminDashboard';
import { AdminProfilePage } from '../pages/admin/AdminProfilePage';
import { AdminFacilitiesPage } from '../pages/admin/AdminFacilitiesPage';
import { AdminTenantsPage } from '../pages/admin/AdminTenantsPage';
import { AdminComplaintsPage } from '../pages/admin/AdminComplaintsPage';
import { AdminPaymentsPage } from '../pages/admin/AdminPaymentsPage';
import { AdminFinancePage } from '../pages/admin/AdminFinancePage';
import { TenantDashboard } from '../pages/TenantDashboard';
import { TenantOverviewPage } from '../pages/tenant/TenantOverviewPage';
import { TenantPaymentsPage } from '../pages/tenant/TenantPaymentsPage';
import { TenantComplaintsPage } from '../pages/tenant/TenantComplaintsPage';
import { TenantProfilePage } from '../pages/tenant/TenantProfilePage';
import AcceptInvite from '../pages/AcceptInvite';
import { UnauthorizedPage } from '../pages/UnauthorizedPage.tsx';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/auth/login" element={<AuthLoginPage />} />
      <Route path="/auth/signup" element={<AuthSignupPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/facilities"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminFacilitiesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tenants"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminTenantsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminComplaintsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPaymentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/finance"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminFinancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenant"
        element={
          <ProtectedRoute requiredRole="tenant">
            <TenantDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenant/overview"
        element={
          <ProtectedRoute requiredRole="tenant">
            <TenantOverviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenant/payments"
        element={
          <ProtectedRoute requiredRole="tenant">
            <TenantPaymentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenant/complaints"
        element={
          <ProtectedRoute requiredRole="tenant">
            <TenantComplaintsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenant/profile"
        element={
          <ProtectedRoute requiredRole="tenant">
            <TenantProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="/accept-invite" element={<AcceptInvite />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;