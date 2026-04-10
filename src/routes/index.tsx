import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Loader2 } from 'lucide-react'

// 🚀 LAZY LOADING COMPONENTS
const Home = lazy(() => import('@/pages/Home'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const AddTransaction = lazy(() => import('@/features/transactions/pages/AddTransaction'))
const Settings = lazy(() => import('@/pages/Settings'))
const Categories = lazy(() => import('@/features/categories/pages/Categories'))
const AddCategory = lazy(() => import('@/features/categories/pages/AddCategory'))
const EditCategory = lazy(() => import('@/features/categories/pages/EditCategory'))
const EditTransaction = lazy(() => import('@/features/transactions/pages/EditTransaction'))
const Wallet = lazy(() => import('@/features/accounts/pages/Wallet'))
const Stats = lazy(() => import('@/pages/Stats'))
const Transactions = lazy(() => import('@/features/transactions/pages/Transactions'))
const Goals = lazy(() => import('@/features/goals/pages/Goals'))
const AddGoal = lazy(() => import('@/features/goals/pages/AddGoal'))
const EditGoal = lazy(() => import('@/features/goals/pages/EditGoal'))
const AISettings = lazy(() => import('@/pages/AISettings'))
// ⏳ Loading Spinner for Suspense
const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
)

// 🗺️ ROUTER DEFINITION
const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <Login />
      </Suspense>
    )
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <Register />
      </Suspense>
    )
  },
  {
    path: '/add',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <AddTransaction />
        </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: '/edit/:id',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <EditTransaction />
        </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Home />
          </Suspense>
        )
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Settings />
          </Suspense>
        )
      },
      {
        path: 'settings/categories',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Categories />
          </Suspense>
        )
      },
      {
        path: 'settings/categories/add',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <AddCategory />
          </Suspense>
        )
      },
      {
        path: 'settings/categories/edit/:id',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <EditCategory />
          </Suspense>
        )
      },
      {
        path: 'settings/ai',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <AISettings />
          </Suspense>
        )
      },
      {
        path: 'ledger',
        element: (
          <Suspense fallback={<LoadingScreen />}>
             <Transactions />
          </Suspense>
        )
      },
      {
        path: 'stats',
        element: (
          <Suspense fallback={<LoadingScreen />}>
             <Stats />
          </Suspense>
        )
      },
      {
        path: 'wallet',
        element: (
          <Suspense fallback={<LoadingScreen />}>
             <Wallet />
          </Suspense>
        )
      },
      {
        path: 'goals',
        element: (
          <Suspense fallback={<LoadingScreen />}>
             <Goals />
          </Suspense>
        )
      },
      {
        path: 'goals/add',
        element: (
          <Suspense fallback={<LoadingScreen />}>
             <AddGoal />
          </Suspense>
        )
      },
      {
        path: 'goals/edit/:id',
        element: (
          <Suspense fallback={<LoadingScreen />}>
             <EditGoal />
          </Suspense>
        )
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
])

const RootRouter: React.FC = () => {
  return <RouterProvider router={router} />
}

export default RootRouter
