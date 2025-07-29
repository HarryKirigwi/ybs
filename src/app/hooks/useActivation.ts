import { useRouter } from 'next/navigation'

export const useActivation = () => {
  const router = useRouter()

  const handleActivateNow = () => {
    console.log('🔄 Redirecting to account activation...')
    router.push('/activate-account')
  }

  return {
    handleActivateNow
  }
} 