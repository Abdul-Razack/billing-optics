import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import AppLayout from '../ui/layouts/AppLayout';
import PosLayout from '../ui/layouts/PosLayout';
import AuthLayout from '../ui/layouts/AuthLayout';
import { ErrorBoundary } from '../ui/components/ErrorBoundary';

const LoginView = React.lazy(() => import('../features/auth/views/LoginView'));
const TerminalView = React.lazy(() => import('../features/pos/views/TerminalView'));
const CatalogView = React.lazy(() => import('../features/inventory/views/CatalogView'));
const PatientHistoryView = React.lazy(() => import('../features/prescriptions/views/PatientHistoryView'));
const EndOfDayView = React.lazy(() => import('../features/reports/views/EndOfDayView'));

export type Role = 'ADMIN' | 'CASHIER' | 'OPTOMETRIST';

const mockAuthState = {
  isAuthenticated: true,
  role: 'ADMIN' as Role,
};

function AuthGuard({ children }: { children: React.ReactNode }): JSX.Element {
  if (!mockAuthState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function RoleGuard({ allowedRoles, children }: { allowedRoles: Role[]; children: React.ReactNode }): JSX.Element {
  if (!allowedRoles.includes(mockAuthState.role)) {
    return <div>Unauthorized</div>;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LoginView />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/pos" replace />,
      },
      {
        path: 'inventory',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'CASHIER', 'OPTOMETRIST']}>
            <ErrorBoundary name="Catalog View">
              <Suspense fallback={<div>Loading...</div>}>
                <CatalogView />
              </Suspense>
            </ErrorBoundary>
          </RoleGuard>
        ),
      },
      {
        path: 'prescriptions',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'OPTOMETRIST']}>
            <Suspense fallback={<div>Loading...</div>}>
              <PatientHistoryView />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: 'reports',
        element: (
          <RoleGuard allowedRoles={['ADMIN']}>
            <ErrorBoundary name="End Of Day View">
              <Suspense fallback={<div>Loading...</div>}>
                <EndOfDayView />
              </Suspense>
            </ErrorBoundary>
          </RoleGuard>
        ),
      },
      {
        path: 'settings',
        element: <div>Settings</div>,
      },
    ],
  },
  {
    path: '/pos',
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={['ADMIN', 'CASHIER']}>
          <PosLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: (
          <ErrorBoundary name="Terminal View">
            <Suspense fallback={<div>Loading...</div>}>
              <TerminalView />
            </Suspense>
          </ErrorBoundary>
        ),
      },
    ],
  },
]);
