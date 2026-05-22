import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router-dom'
import { AppProviders } from './providers'
import { router } from './routes'

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          className: 'border border-gray-200 bg-white text-sm text-gray-900 shadow-lg',
        }}
      />
    </AppProviders>
  )
}
