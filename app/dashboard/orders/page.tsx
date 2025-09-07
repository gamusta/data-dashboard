import { Suspense } from 'react'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { OrdersPageClient } from '@/components/orders/orders-page-client'
import { OrdersTableSkeleton } from '@/components/orders/orders-table-skeleton'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const user = await getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all orders
          </p>
        </div>
      </div>

      <Suspense fallback={<OrdersTableSkeleton />}>
        <OrdersPageClient user={user} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}