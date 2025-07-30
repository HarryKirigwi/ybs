// app/components/AppContent.tsx
'use client'
import { useState } from 'react'
import TopNavigation from './TopNavigation'
import BottomNavigation from './BottomNavigation'
import Dashboard from './Dashboard'
import TasksPage from './TasksPage'
import WalletPage from './WalletPage'
import ProfilePage from './ProfilePage'

// Main App Content - only shows when authenticated
export default function AppContent() {
  const [activeTab, setActiveTab] = useState('home')

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard />
      case 'tasks':
        return <TasksPage />
      case 'wallet':
        return <WalletPage />
      case 'profile':
        return <ProfilePage />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="pb-20 pt-16">
        {renderContent()}
      </main>
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}