
'use client'
import { useState } from 'react'
import TopNavigation from './components/TopNavigation'
import BottomNavigation from './components/BottomNavigation'
import Dashboard from './components/Dashboard'
import TasksPage from './components/TasksPage'
import WalletPage from './components/WalletPage'
import ProfilePage from './components/ProfilePage'

export default function Home() {
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