// app/auth/login/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '../../context/AuthContext'
import Login from '../../components/Login'

function LoginContent() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const handleSwitchToRegister = () => {
    router.push('/auth/register')
  }

  return <Login onSwitchToRegister={handleSwitchToRegister} />
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginContent />
    </AuthProvider>
  )
}