import { createBrowserRouter, Navigate } from 'react-router-dom'
import { DashboardPage } from '../features/tasks/pages/DashboardPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
