'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Don't show Header and Footer on admin pages
  const isAdminPage = pathname?.startsWith('/admin')
  
  if (isAdminPage) {
    // Admin pages: no Header, no Footer
    return <>{children}</>
  }
  
  // Client pages: show Header and Footer
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}


