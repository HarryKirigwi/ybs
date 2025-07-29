import { useState } from 'react'
import { useRouter } from 'next/navigation' // or 'next/router'
import { useAuth } from '../contexts/AuthContext'

export function useLogout() {
  const { signOut } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const logout = async (redirectPath: string = '/login') => {
    setIsLoggingOut(true)
    try {
      const result = await signOut()
      if (result.success) {
        console.log('Logout successful')
      } else {
        console.error('Logout issue:', result.error)
      }
      router.push(redirectPath)
      return result
    } catch (error) {
      console.error('Unexpected logout error:', error)
      router.push(redirectPath)
      return { success: false, error: 'Unexpected error during logout' }
    } finally {
      setIsLoggingOut(false)
    }
  }

  return { logout, isLoggingOut }
}