import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { orderFiltersSchema } from '@/lib/validations/order'
import { format } from 'date-fns'
import { unparse } from 'papaparse'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)
    
    // Handle array parameters
    if (params.status) {
      params.status = params.status.split(',')
    }
    if (params.tags) {
      params.tags = params.tags.split(',')
    }

    const filters = orderFiltersSchema.parse(params)
    
    // Build where clause (same as in GET /api/orders)
    const where: Prisma.OrderWhereInput = {}
    
    if (filters.q) {
      where.OR = [
        { orderNo: { contains: filters.q, mode: 'insensitive' } },
        { customer: { name: { contains: filters.q, mode: 'insensitive' } } },
        { customer: { company: { contains: filters.q, mode: 'insensitive' } } },
      ]
    }
    
    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status }
    }
    
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo + 'T23:59:59.999Z')
      }
    }
    
    if (filters.customerId) {
      where.customerId = filters.customerId
    }
    
    if (filters.amountMin !== undefined || filters.amountMax !== undefined) {
      where.amountDecimal = {}
      if (filters.amountMin !== undefined) {
        where.amountDecimal.gte = filters.amountMin
      }
      if (filters.amountMax !== undefined) {
        where.amountDecimal.lte = filters.amountMax
      }
    }
    
    if (filters.currency) {
      where.currency = filters.currency
    }
    
    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: { in: filters.tags }
          }
        }
      }
    }

    // Build order by
    const orderBy: Prisma.OrderOrderByWithRelationInput[] = []
    if (filters.sort) {
      const sortParts = filters.sort.split(',')
      for (const sortPart of sortParts) {
        const [field, direction] = sortPart.split(':')
        if (field === 'customer.name') {
          orderBy.push({ customer: { name: direction as 'asc' | 'desc' } })
        } else if (field && ['orderNo', 'status', 'amountDecimal', 'currency', 'createdAt'].includes(field)) {
          orderBy.push({ [field]: direction as 'asc' | 'desc' })
        }
      }
    }
    
    if (orderBy.length === 0) {
      orderBy.push({ createdAt: 'desc' })
    }

    // Get all matching orders (no pagination for export)
    const orders = await prisma.order.findMany({
      where,
      orderBy,
      include: {
        customer: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    // Transform data for CSV
    const csvData = orders.map(order => ({
      'Order Number': order.orderNo,
      'Customer Name': order.customer.name,
      'Customer Email': order.customer.email,
      'Customer Company': order.customer.company || '',
      'Status': order.status,
      'Amount': order.amountDecimal.toString(),
      'Currency': order.currency,
      'Tags': order.tags.map(ot => ot.tag.name).join(', '),
      'Created Date': format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    }))

    const csv = unparse(csvData)
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm')
    const filename = `orders-export-${timestamp}.csv`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting orders:', error)
    return NextResponse.json(
      { error: 'Failed to export orders' },
      { status: 500 }
    )
  }
}