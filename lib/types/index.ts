import { Prisma } from '@prisma/client'

export type OrderWithCustomer = Prisma.OrderGetPayload<{
  include: {
    customer: true
    tags: {
      include: {
        tag: true
      }
    }
  }
}>

export type CustomerWithOrders = Prisma.CustomerGetPayload<{
  include: {
    orders: true
  }
}>

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}