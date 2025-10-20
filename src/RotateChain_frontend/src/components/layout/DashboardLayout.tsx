import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '../ui/sidebar'
import { DashboardSidebar } from './DashboardSidebar'
import Header from './Header'

// Dashboard Pages
import Dashboard from '../../pages/Dashboard'
import ChainsPage from '../../pages/ChainsPage'
import CreateChainPage from '../../pages/CreateChainPage'
// --- ADD NEW IMPORT ---
import ChainDetailsPage from '../../pages/ChainDetailsPage' 
import GroupsPage from '../../pages/GroupsPage'
import PoolsPage from '../../pages/PoolsPage'
import ProfilePage from '../../pages/ProfilePage'
import NotFoundPage from '../../pages/NotFoundPage'

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SidebarProvider>
        <div className="flex h-[calc(100vh-4rem)]">
          <DashboardSidebar />
          <SidebarInset className="flex-1 overflow-auto">
            <main className="container mx-auto px-4 py-6">
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="chains" element={<ChainsPage />} />
                <Route path="chains/new" element={<CreateChainPage />} />
                {/* --- ADD DYNAMIC ROUTE FOR CHAIN DETAILS --- */}
                <Route path="chains/:id" element={<ChainDetailsPage />} />
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