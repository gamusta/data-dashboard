'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import type { OrderWithCustomer } from '@/lib/types'
import type { UserRole } from '@prisma/client'

interface OrdersTableProps {
  data: OrderWithCustomer[]
  isLoading: boolean
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  onSortChange: (sort: string) => void
  currentSort?: string
  userRole: UserRole
}

export function OrdersTable({
  data,
  isLoading,
  pagination,
  onPageChange,
  onSortChange,
  currentSort,
  userRole
}: OrdersTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete order')
      
      toast.success('Order deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete order')
    } finally {
      setDeletingId(null)
    }
  }

  const getSortIcon = (columnId: string) => {
    if (!currentSort) return <ArrowUpDown className="w-4 h-4" />
    
    const sorts = currentSort.split(',')
    const columnSort = sorts.find(s => s.startsWith(columnId))
    
    if (!columnSort) return <ArrowUpDown className="w-4 h-4" />
    
    const [, direction] = columnSort.split(':')
    return direction === 'asc' ? 
      <ArrowUp className="w-4 h-4" /> : 
      <ArrowDown className="w-4 h-4" />
  }

  const handleSort = (columnId: string) => {
    const sorts = currentSort ? currentSort.split(',') : []
    const existingSortIndex = sorts.findIndex(s => s.startsWith(columnId))
    
    if (existingSortIndex >= 0) {
      const [, direction] = sorts[existingSortIndex].split(':')
      if (direction === 'asc') {
        sorts[existingSortIndex] = `${columnId}:desc`
      } else {
        sorts.splice(existingSortIndex, 1)
      }
    } else {
      sorts.push(`${columnId}:asc`)
    }
    
    onSortChange(sorts.join(','))
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      NEW: 'default',
      PROCESSING: 'secondary',
      SHIPPED: 'default',
      CANCELLED: 'destructive'
    } as const

    const colors = {
      NEW: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      PROCESSING: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
      SHIPPED: 'bg-green-50 text-green-700 hover:bg-green-100',
      CANCELLED: 'bg-red-50 text-red-700 hover:bg-red-100'
    } as const

    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || 'default'}
        className={colors[status as keyof typeof colors]}
      >
        {status}
      </Badge>
    )
  }

  const formatCurrency = (amount: string, currency: string) => {
    const num = parseFloat(amount)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(num)
  }

  const columns: ColumnDef<OrderWithCustomer>[] = [
    {
      accessorKey: 'orderNo',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => handleSort('orderNo')}
          className="h-8 px-2 lg:px-3 hover:bg-gray-50"
        >
          Order No
          {getSortIcon('orderNo')}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.orderNo}
        </div>
      ),
    },
    {
      accessorKey: 'customer.name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => handleSort('customer.name')}
          className="h-8 px-2 lg:px-3 hover:bg-gray-50"
        >
          Customer
          {getSortIcon('customer.name')}
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.customer.name}</div>
          {row.original.customer.company && (
            <div className="text-sm text-muted-foreground">
              {row.original.customer.company}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => handleSort('status')}
          className="h-8 px-2 lg:px-3 hover:bg-gray-50"
        >
          Status
          {getSortIcon('status')}
        </Button>
      ),
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'amountDecimal',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => handleSort('amountDecimal')}
          className="h-8 px-2 lg:px-3 hover:bg-gray-50"
        >
          Amount
          {getSortIcon('amountDecimal')}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency(row.original.amountDecimal.toString(), row.original.currency)}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => handleSort('createdAt')}
          className="h-8 px-2 lg:px-3 hover:bg-gray-50"
        >
          Created
          {getSortIcon('createdAt')}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {format(new Date(row.original.createdAt), 'MMM d, yyyy')}
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/orders/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </DropdownMenuItem>
            {userRole === 'ADMIN' && (
              <>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/orders/${row.original.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Order</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete order {row.original.orderNo}? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(row.original.id)}
                        disabled={deletingId === row.original.id}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deletingId === row.original.id ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-50/50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/orders/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      onClick={cell.column.id === 'actions' ? (e) => e.stopPropagation() : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.totalPages} ({pagination.total} total orders)
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}