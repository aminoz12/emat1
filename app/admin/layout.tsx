'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  FileText
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useSupabaseSession } from '@/hooks/useSupabaseSession'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading } = useSupabaseSession()
  const router = useRouter()
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isCheckingRole, setIsCheckingRole] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Don't check if we're on the login page
      if (pathname === '/admin/login') {
        setIsCheckingRole(false)
        return
      }

      // Wait for loading to complete
      if (loading) {
        setIsCheckingRole(true)
        return
      }
      
      // If no user, redirect to admin login
      if (!user) {
        if (pathname !== '/admin/login') {
          router.push('/admin/login')
        }
        return
      }

      try {
        // Check if user is admin
        const supabase = createClient()
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          if (pathname !== '/admin/login') {
            router.push('/admin/login')
          }
          return
        }

        if (!profile) {
          console.error('Profile not found for user:', user.id)
          if (pathname !== '/admin/login') {
            router.push('/admin/login')
          }
          return
        }

        // Check if user has admin role
        const userRole = profile.role || 'USER'
        console.log('User role check:', { userId: user.id, role: userRole, pathname })
        
        // IMPORTANT: NEVER redirect admins to /dashboard
        // Only redirect NON-ADMINS away from /admin pages
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
          console.log('User is not admin, redirecting to client dashboard. Role:', userRole)
          // Only redirect NON-ADMINS to client dashboard
          // This should never happen for admins
          if (pathname.startsWith('/admin') && 
              pathname !== '/admin/login' && 
              pathname !== '/admin/check-role') {
            router.push('/dashboard')
          }
          return
        }
        
        // User IS admin - allow access and NEVER redirect to /dashboard
        console.log('User is admin, allowing access to admin panel')

        // User is admin, allow access
        console.log('User is admin, allowing access')
        setUserRole(userRole)
        setIsCheckingRole(false)
      } catch (error) {
        console.error('Error checking admin access:', error)
        if (pathname !== '/admin/login') {
          router.push('/admin/login')
        }
      }
    }

    checkAdminAccess()
  }, [user, loading, router, pathname])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const navigation = [
    { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
    { name: 'Commandes', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Documents', href: '/admin/documents', icon: FileText },
    { name: 'Utilisateurs', href: '/admin/users', icon: Users },
    { name: 'Paramètres', href: '/admin/settings', icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  // Don't show admin layout on login, check-role, setup-admins, init-admins, or diagnostic pages
  if (pathname === '/admin/login' || pathname === '/admin/check-role' || pathname === '/admin/setup-admins' || pathname === '/admin/init-admins' || pathname === '/admin/diagnostic') {
    return <>{children}</>
  }

  if (loading || isCheckingRole) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des droits d'accès...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
            <Link href="/admin" className="flex items-center">
              <span className="text-white font-bold text-xl">EMatricule</span>
            </Link>
            <button
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-400">
                  {userRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Administrateur'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              className="lg:hidden text-gray-600 hover:text-gray-900"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1"></div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

