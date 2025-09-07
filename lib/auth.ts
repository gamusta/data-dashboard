'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { User } from '@prisma/client'
import { cookies } from 'next/headers'

export async function getUser(): Promise<User | null> {
  try {
    // Ensure we're in a request context
    const cookieStore = cookies()
    const supabase = createClient()
    const { data: { user: authUser }, error } = await supabase.auth.getUser()

    if (error || !authUser) {
      return null
    }

    // Get or create user in our database
    let user = await prisma.user.findUnique({
      where: { email: authUser.email! }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: authUser.email!,
          role: 'VIEWER'
        }
      })
    }

    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
  return user
}