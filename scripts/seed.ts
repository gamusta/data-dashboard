import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const COMPANIES = [
  'TechCorp Solutions', 'Global Dynamics', 'InnovateTech', 'DataFlow Systems',
  'CloudFirst Inc', 'NextGen Software', 'Digital Horizons', 'SmartOps Ltd',
  'FutureScale', 'ProActive Systems', 'AgileCore', 'StreamlineTech'
]

const CUSTOMER_NAMES = [
  'Alice Johnson', 'Bob Wilson', 'Carol Davis', 'David Brown', 'Emily Chen',
  'Frank Miller', 'Grace Lee', 'Henry Taylor', 'Isabel Rodriguez', 'Jack Anderson',
  'Kate Thompson', 'Liam O\'Connor', 'Maya Patel', 'Nathan Kim', 'Olivia White',
  'Paul Jackson', 'Quinn Murphy', 'Rachel Green', 'Sam Foster', 'Tara Williams'
]

const TAGS = ['urgent', 'international', 'bulk', 'premium', 'standard', 'express']

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      role: 'ADMIN',
    },
  })
  console.log('✅ Created admin user')

  // Create viewer user
  const viewerUser = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      email: 'viewer@example.com',
      role: 'VIEWER',
    },
  })
  console.log('✅ Created viewer user')

  // Create tags
  const tags = await Promise.all(
    TAGS.map(name =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  )
  console.log('✅ Created tags')

  // Create customers
  const customers = await Promise.all(
    CUSTOMER_NAMES.map((name, index) =>
      prisma.customer.upsert({
        where: { email: `${name.toLowerCase().replace(/\s+/g, '.')}@email.com` },
        update: {},
        create: {
          name,
          email: `${name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
          company: Math.random() > 0.3 ? COMPANIES[Math.floor(Math.random() * COMPANIES.length)] : null,
        },
      })
    )
  )
  console.log('✅ Created customers')

  // Create orders
  const statuses = ['NEW', 'PROCESSING', 'SHIPPED', 'CANCELLED'] as const
  const currencies = ['EUR', 'USD'] as const

  const orders = []
  for (let i = 1; i <= 2000; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const currency = currencies[Math.floor(Math.random() * currencies.length)]
    const amount = Math.random() * 5000 + 10 // Between $10 and $5010
    
    // Create date between 6 months ago and now
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 180))
    
    const order = await prisma.order.create({
      data: {
        orderNo: `ORD-${String(i).padStart(6, '0')}`,
        customerId: customer.id,
        status,
        amountDecimal: Math.round(amount * 100) / 100, // Round to 2 decimal places
        currency,
        createdAt,
      },
    })

    // Add random tags to some orders
    if (Math.random() > 0.6) {
      const numTags = Math.floor(Math.random() * 3) + 1
      const selectedTags = tags.sort(() => 0.5 - Math.random()).slice(0, numTags)
      
      await Promise.all(
        selectedTags.map(tag =>
          prisma.orderTag.create({
            data: {
              orderId: order.id,
              tagId: tag.id,
            },
          })
        )
      )
    }

    orders.push(order)
    
    if (i % 100 === 0) {
      console.log(`✅ Created ${i} orders`)
    }
  }

  console.log('🎉 Database seeded successfully!')
  console.log(`- Users: 2 (admin@example.com, viewer@example.com)`)
  console.log(`- Customers: ${customers.length}`)
  console.log(`- Orders: ${orders.length}`)
  console.log(`- Tags: ${tags.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })