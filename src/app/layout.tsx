// app/layout.tsx
import './globals.css' // Make sure you have Tailwind CSS configured
import { AdminAuthProvider } from './components/admin/contexts/AdminAuthContext'
import { OfflineProvider } from './contexts/OfflineContext'
import { OfflineBanner } from './components/NetworkStatusIndicator'

export const metadata = {
  title: 'YBS - Your Business Success',
  description: 'Earn money through referrals and business opportunities',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'YBS',
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <OfflineProvider>
          <AdminAuthProvider>
            <OfflineBanner />
            {children}
          </AdminAuthProvider>
        </OfflineProvider>
      </body>
    </html>
  )
}