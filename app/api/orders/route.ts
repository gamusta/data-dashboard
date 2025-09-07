import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { orderFiltersSchema, createOrderSchema } from '@/lib/validations/order'
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
    
    // Build where clause
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

    // Get total count
    const total = await prisma.order.count({ where })
    
    // Get paginated data
    const orders = await prisma.order.findMany({
      where,
      orderBy,
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      include: {
        customer: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    const totalPages = Math.ceil(total / filters.pageSize)

    return NextResponse.json({
      data: orders,
      pagination: {
        page: filters.page,
        pageSize: filters.pageSize,
        total,
        totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    
    const body = await request.json()
    const data = createOrderSchema.parse(body)
    
    const order = await prisma.order.create({
      data,
      include: {
        customer: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}