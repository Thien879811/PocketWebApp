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
const BudgetPlanner = lazy(() => import('@/features/budget/pages/BudgetPlanner'))
const BudgetHistory = lazy(() => import('@/features/budget/pages/BudgetHistory'))
const BudgetHistoryDetail = lazy(() => import('@/features/budget/pages/BudgetHistoryDetail'))
const BalanceHistory = lazy(() => import('@/features/accounts/pages/BalanceHistory'))
const ReloDashboard = lazy(() => import('@/apps/relo/pages/Dashboard'))
const ReloLayout = lazy(() => import('@/apps/relo/layouts/ReloLayout'))
const ReloContacts = lazy(() => import('@/apps/relo/pages/Contacts'))
const ReloAnniversaries = lazy(() => import('@/apps/relo/pages/Anniversaries'))
const ReloAppointments = lazy(() => import('@/apps/relo/pages/Appointments'))
const ReloPreferences = lazy(() => import('@/apps/relo/pages/Preferences'))
const ReloSettingsPage = lazy(() => import('@/apps/relo/pages/ReloSettings'))
const ReloCreateAnniversary = lazy(() => import('@/apps/relo/pages/CreateAnniversary'))
const ReloEditAnniversary = lazy(() => import('@/apps/relo/pages/EditAnniversary'))
const ReloCreateEvent = lazy(() => import('@/apps/relo/pages/CreateEvent'))
const ReloEditEvent = lazy(() => import('@/apps/relo/pages/EditEvent'))
const ReloCreatePreference = lazy(() => import('@/apps/relo/pages/CreatePreference'))
const ReloEditPreference = lazy(() => import('@/apps/relo/pages/EditPreference'))
// ⏳ Loading Spinner for Suspense
const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-surface dark:bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary dark:glow" />
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
      },
      {
        path: 'budget',
        element: (
          <Suspense fallback={<LoadingScreen />}>
             <BudgetPlanner />
          </Suspense>
        )
      },
      {
        path: 'settings/budget-history',
        element: (
          <Suspense fallback={<LoadingScreen />}>
             <BudgetHistory />
          </Suspense>
        )
      },
      {
        path: 'settings/budget-history/:id',
        element: (
          <Suspense fallback={<LoadingScreen />}>
             <BudgetHistoryDetail />
          </Suspense>
        )
      },
      {
        path: 'settings/balance-history',
        element: (
          <Suspense fallback={<LoadingScreen />}>
             <BalanceHistory />
          </Suspense>
        )
      }
    ]
  },
  {
    path: '/relo',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <ReloLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Suspense fallback={<LoadingScreen />}><ReloDashboard /></Suspense> },
      { path: 'contacts', element: <Suspense fallback={<LoadingScreen />}><ReloContacts /></Suspense> },
      { path: 'anniversaries', element: <Suspense fallback={<LoadingScreen />}><ReloAnniversaries /></Suspense> },
      { path: 'anniversaries/create', element: <Suspense fallback={<LoadingScreen />}><ReloCreateAnniversary /></Suspense> },
      { path: 'anniversaries/edit/:id', element: <Suspense fallback={<LoadingScreen />}><ReloEditAnniversary /></Suspense> },
      { path: 'appointments', element: <Suspense fallback={<LoadingScreen />}><ReloAppointments /></Suspense> },
      { path: 'events/create', element: <Suspense fallback={<LoadingScreen />}><ReloCreateEvent /></Suspense> },
      { path: 'events/edit/:id', element: <Suspense fallback={<LoadingScreen />}><ReloEditEvent /></Suspense> },
      { path: 'preferences', element: <Suspense fallback={<LoadingScreen />}><ReloPreferences /></Suspense> },
      { path: 'preferences/create', element: <Suspense fallback={<LoadingScreen />}><ReloCreatePreference /></Suspense> },
      { path: 'preferences/edit/:id', element: <Suspense fallback={<LoadingScreen />}><ReloEditPreference /></Suspense> },
      { path: 'settings', element: <Suspense fallback={<LoadingScreen />}><ReloSettingsPage /></Suspense> },
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
