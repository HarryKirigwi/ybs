// app/layout.tsx
import './globals.css' // Make sure you have Tailwind CSS configured

export const metadata = {
  title: 'YBS - Your Business Success',
  description: 'Earn money through referrals and business opportunities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}