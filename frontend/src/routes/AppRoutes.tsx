import { Navigate, useRoutes } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout.tsx'
import { HomePage } from '@/pages/home/HomePage.tsx'
import { SettingsPage } from '@/pages/settings/SettingsPage.tsx'

export function AppRoutes() {
  return useRoutes([
    {
      path: '/',
      element: <MainLayout />, 
      children: [
        { index: true, element: <HomePage /> },
        { path: 'settings', element: <SettingsPage /> },
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ])
}
