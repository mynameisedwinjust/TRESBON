import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'
import { cookies } from 'next/headers'

export async function trackActivity(userId: string) {
  if (!userId || userId === 'pin-access') return
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        lastActive: new Date(),
        isOnline: true 
      }
    })
  } catch (error) {
    // console.warn("Failed to track activity:", error)
  }
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session || !(session.user as any)?.phone) {
    return null
  }
  return session.user
}

export async function getCurrentCustomer() {
  const user = await getCurrentUser()
  if (!(user as any)?.phone) return null

  const customer = await prisma.customer.findUnique({
    where: {
      phone: (user as any).phone.trim()
    }
  })

  return customer
}

export async function getCurrentStaffUser() {
  const user = await getCurrentUser()
  if (!user) return null

  const staffUser = await prisma.user.findUnique({
    where: {
      id: user.id,
      role: { in: ['admin', 'cashier', 'cleaner', 'delivery', 'supervisor'] }
    }
  })

  return staffUser
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  await trackActivity(user.id)
  return user
}

export async function requireCustomer() {
  const customer = await getCurrentCustomer()
  if (!customer) {
    throw new Error('Customer not found')
  }
  return customer
}

export async function requireAdmin() {
  try {
    // 1. Check for authenticated Admin User (Session)
    const user = await getCurrentUser()
    const validStaffRoles = ['admin', 'supervisor', 'cashier', 'cleaner', 'delivery']
    if (user && validStaffRoles.includes((user as any).role || '')) {
      await trackActivity(user.id)
      return {
        id: user.id,
        phone: (user as any).phone!,
        fullName: user.name,
        role: (user as any).role,
        isActive: true,
      } as any
    }

    // 2. Check for PIN access (Fallback)
    const cookieStore = await cookies()
    const pinAccess = cookieStore.get('admin_pin_access')?.value === 'true'

    if (pinAccess) {
      // PIN access granted - return a mock admin user for PIN access
      return {
        id: 'pin-access',
        email: 'admin@pin-access',
        fullName: 'Admin (PIN Access)',
        role: 'admin',
        isActive: true,
      } as any
    }

    // No PIN access - deny admin access
    throw new Error('Admin access required. Please use PIN authentication.')
  } catch (error: any) {
    // Re-throw auth errors as-is
    if (error.message === 'Unauthorized' || error.message === 'Admin access required' || error.message.includes('PIN')) {
      throw error
    }
    // Wrap other errors
    console.error("Error in requireAdmin:", error)
    throw new Error('Admin access required. Please use PIN authentication.')
  }
}

