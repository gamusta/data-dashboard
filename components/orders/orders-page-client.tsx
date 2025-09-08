'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { OrdersTable } from './orders-table'
import { OrdersFilters } from './orders-filters'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Download } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@prisma/client'
import type { OrderWithCustomer, PaginatedResponse } from '@/lib/types'

interface OrdersPageClientProps {
  user: User
  searchParams: { [key: string]: string | string[] | undefined }
}

export function OrdersPageClient({ user, searchParams }: OrdersPageClientProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const [orders, setOrders] = useState<OrderWithCustomer[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  // Convert searchParams to URL search params - memoize with stable dependencies
  const currentFiltersString = useMemo(() => {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','))
        } else {
          params.set(key, value)
        }
      }
    })
    return params.toString()
  }, [searchParams])

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/orders?${currentFiltersString}`)
      if (!response.ok) throw new Error('Failed to fetch orders')
      
      const data: PaginatedResponse<OrderWithCustomer> = await response.json()
      setOrders(data.data)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setIsLoading(false)
    }
  }, [currentFiltersString])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleFiltersChange = useCallback((newFilters: Record<string, any>) => {
    const params = new URLSearchParams(searchParams as any)
    
    // Reset page to 1 when filters change
    params.set('page', '1')
    
    // Update or remove filter parameters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        params.delete(key)
      } else if (Array.isArray(value)) {
        params.set(key, value.join(','))
      } else {
        params.set(key, value.toString())
      }
    })

    router.push(`/dashboard/orders?${params.toString()}`)
  }, [router, searchParams])

  const handlePageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams as any)
    params.set('page', page.toString())
    router.push(`/dashboard/orders?${params.toString()}`)
  }, [router, searchParams])

  const handleSortChange = useCallback((sort: string) => {
    const params = new URLSearchParams(searchParams as any)
    params.set('sort', sort)
    params.set('page', '1') // Reset to first page
    router.push(`/dashboard/orders?${params.toString()}`)
  }, [router, searchParams])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/orders/export?${currentFiltersString}`)
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch?.[1] || 'orders-export.csv'
      
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Orders exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export orders')
    } finally {
      setIsExporting(false)
    }
  }

  const clearFilters = useCallback(() => {
    router.push('/dashboard/orders?page=1')
  }, [router])

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={handleExport} disabled={isExporting} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Button onClick={clearFilters} variant="ghost">
              Clear Filters
            </Button>
          </div>
          
          {user.role === 'ADMIN' && (
            <Button onClick={() => router.push('/dashboard/orders/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Order
            </Button>
          )}
        </div>

        {/* Filters */}
        <OrdersFilters
          filters={searchParams}
          onFiltersChange={handleFiltersChange}
        />

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {orders.length} of {pagination.total} orders
          </div>
          <div>
            Page {pagination.page} of {pagination.totalPages}
          </div>
        </div>

        {/* Table */}
        <OrdersTable
          data={orders}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          currentSort={searchParams.sort as string}
          userRole={user.role}
        />
      </div>
    </Card>
  )
}