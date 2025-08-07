export const config = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}

export function apiUrl(path: string) {
  if (path.startsWith('http')) return path
  return `${config.backendUrl}${path}`
}

export function isSecureContext() {
  if (typeof window !== 'undefined') {
    return window.location.protocol === 'https:'
  }
  return config.isProduction
}
