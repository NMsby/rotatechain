import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '../ui/sidebar'
import { DashboardSidebar } from './DashboardSidebar'
import Header from './Header'

// Dashboard Pages
import Dashboard from '../../pages/Dashboard'
import ChainsPage from '../../pages/ChainsPage'
import CreateChainPage from '../../pages/CreateChainPage'
import GroupsPage from '../../pages/GroupsPage'
import PoolsPage from '../../pages/PoolsPage'
import ProfilePage from '../../pages/ProfilePage'
import NotFoundPage from '../../pages/NotFoundPage'

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed header */}
      <Header />

      <SidebarProvider>
        <div className="flex">
          {/* Sidebar is offset below header */}
          <DashboardSidebar />

          {/* Main content */}
          <SidebarInset className="flex-1 overflow-auto mt-16">
            <main className="w-full min-h-[calc(100vh-4rem)] px-4 py-6">
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="chains" element={<ChainsPage />} />
                <Route path="chains/new" element={<CreateChainPage />} />
                <Route path="groups" element={<GroupsPage />} />
                <Route path="pools" element={<PoolsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}

export default DashboardLayout
