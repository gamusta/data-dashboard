import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { Toaster } from '@/components/ui/sonner'
import { Suspense } from 'react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  )
}

async function DashboardContent({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <DashboardNav user={user} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Toaster richColors position="top-right" />
    </div>
  )
}