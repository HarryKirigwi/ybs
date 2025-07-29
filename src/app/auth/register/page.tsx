'use client'
import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'
import Register from '../../components/Register'

function RegisterContent() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // Removed useEffect that redirects to '/' if isAuthenticated

  const handleSwitchToLogin = () => {
    router.push('/auth/login')
  }

  return <Register onSwitchToLogin={handleSwitchToLogin} />
}

export default function RegisterPage() {
  return (
    <AuthProvider>
      <Suspense>
        <RegisterContent />
      </Suspense>
    </AuthProvider>
  )
}