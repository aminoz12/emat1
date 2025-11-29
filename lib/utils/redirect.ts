import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

/**
 * Redirect user to appropriate dashboard based on their role
 * Admins go to /admin, regular users go to /dashboard
 */
export async function redirectToDashboard(user: User | null, router: any) {
  if (!user) {
    router.push('/connexion')
    return
  }

  try {
    const supabase = createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('Error checking user role for redirect:', error)
    // Default to dashboard if error
    router.push('/dashboard')
  }
}

/**
 * Get redirect path based on user role
 */
export async function getDashboardPath(user: User | null): Promise<string> {
  if (!user) {
    return '/connexion'
  }

  try {
    const supabase = createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
      return '/admin'
    } else {
      return '/dashboard'
    }
  } catch (error) {
    console.error('Error checking user role for redirect:', error)
    return '/dashboard'
  }
}


