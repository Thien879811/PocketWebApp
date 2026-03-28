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
        path: 'stats',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <div className="p-8"><h1 className="text-2xl font-bold">Stats</h1><p className="mt-2 text-neutral-500">Coming soon...</p></div>
          </Suspense>
        )
      },
      {
        path: 'wallet',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <div className="p-8"><h1 className="text-2xl font-bold">Wallet</h1><p className="mt-2 text-neutral-500">Coming soon...</p></div>
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
