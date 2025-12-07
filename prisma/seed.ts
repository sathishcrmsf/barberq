// @cursor: Comprehensive seed script for testing all insights
// Generates data for: churn risk, no-shows, upsells, revenue trends, staff performance, repeat visits, slot optimization

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to get random element from array
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Helper to get random number in range
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Helper to add days to date
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Helper to get random date in range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

async function main() {
  console.log('🌱 Starting comprehensive seed for insights testing...')

  // Clear existing data
  console.log('🧹 Cleaning existing data...')
  await prisma.walkIn.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.staffService.deleteMany()
  await prisma.staff.deleteMany()
  await prisma.service.deleteMany()
  await prisma.category.deleteMany()

  // 1. Create Categories
  console.log('📁 Creating categories...')
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Haircuts',
        description: 'Classic and modern haircut styles',
        icon: 'Scissors',
        displayOrder: 1,
        isActive: true,
        updatedAt: new Date(),
      },
    }),
    prisma.category.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Beard & Shave',
        description: 'Grooming services for facial hair',
        icon: 'Sparkles',
        displayOrder: 2,
        isActive: true,
        updatedAt: new Date(),
      },
    }),
    prisma.category.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Hair Treatments',
        description: 'Professional hair care treatments',
        icon: 'Droplet',
        displayOrder: 3,
        isActive: true,
        updatedAt: new Date(),
      },
    }),
    prisma.category.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Styling',
        description: 'Special occasion styling services',
        icon: 'Sparkle',
        displayOrder: 4,
        isActive: true,
        updatedAt: new Date(),
      },
    }),
  ])

  // 2. Create Services (mix of basic and premium for upsell detection)
  console.log('✂️ Creating services...')
  const services = await Promise.all([
    // Basic services (lower price)
    prisma.service.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Classic Haircut',
        price: 30,
        duration: 30,
        description: 'Traditional haircut',
        categoryId: categories[0].id,
        isActive: true,
        updatedAt: new Date(),
      },
    }),
    prisma.service.create({
      data: {
        name: 'Buzz Cut',
        price: 20,
        duration: 20,
        description: 'Quick buzz cut',
        categoryId: categories[0].id,
        isActive: true,
        id: crypto.randomUUID(),
        updatedAt: new Date(),
      },
    }),
    prisma.service.create({
      data: {
        name: 'Beard Trim',
        price: 18,
        duration: 20,
        description: 'Beard shaping',
        categoryId: categories[1].id,
        isActive: true,
        id: crypto.randomUUID(),
        updatedAt: new Date(),
      },
    }),
    prisma.service.create({
      data: {
        name: 'Kids Haircut',
        price: 25,
        duration: 25,
        description: 'Haircut for children',
        categoryId: categories[0].id,
        isActive: true,
        id: crypto.randomUUID(),
        updatedAt: new Date(),
      },
    }),
    // Premium services (higher price)
    prisma.service.create({
      data: {
        name: 'Premium Fade',
        price: 50,
        duration: 45,
        description: 'High-quality fade',
        categoryId: categories[0].id,
        isActive: true,
        id: crypto.randomUUID(),
        updatedAt: new Date(),
      },
    }),
    prisma.service.create({
      data: {
        name: 'Hot Towel Shave',
        price: 45,
        duration: 35,
        description: 'Luxury shave',
        categoryId: categories[1].id,
        isActive: true,
        id: crypto.randomUUID(),
        updatedAt: new Date(),
      },
    }),
    prisma.service.create({
      data: {
        name: 'Beard & Haircut Combo',
        price: 55,
        duration: 50,
        description: 'Complete grooming',
        categoryId: categories[1].id,
        isActive: true,
        id: crypto.randomUUID(),
        updatedAt: new Date(),
      },
    }),
    prisma.service.create({
      data: {
        name: 'Hair Coloring',
        price: 85,
        duration: 90,
        description: 'Professional coloring',
        categoryId: categories[2].id,
        isActive: true,
        id: crypto.randomUUID(),
        updatedAt: new Date(),
      },
    }),
    prisma.service.create({
      data: {
        name: 'Scalp Treatment',
        price: 60,
        duration: 40,
        description: 'Deep scalp treatment',
        categoryId: categories[2].id,
        isActive: true,
        id: crypto.randomUUID(),
        updatedAt: new Date(),
      },
    }),
    prisma.service.create({
      data: {
        name: 'Hair Styling',
        price: 40,
        duration: 30,
        description: 'Event styling',
        categoryId: categories[3].id,
        isActive: true,
        id: crypto.randomUUID(),
        updatedAt: new Date(),
      },
    }),
  ])

  // 3. Create Staff
  console.log('👨‍💼 Creating staff members...')
  const staff = await Promise.all([
    prisma.staff.create({
      data: {
        name: 'Marcus Thompson',
        title: 'Master Barber',
        email: 'marcus@barberq.com',
        phone: '(555) 123-4567',
        bio: '15 years experience',
        displayOrder: 1,
        isActive: true,
        id: crypto.randomUUID(),
        updatedAt: new Date(),
      },
    }),
    prisma.staff.create({
      data: {
        name: 'Diego Rodriguez',
        title: 'Senior Stylist',
        email: 'diego@barberq.com',
        phone: '(555) 234-5678',
        bio: 'Expert in classic cuts',
        displayOrder: 2,
        isActive: true,
        id: crypto.randomUUID(),
        updatedAt: new Date(),
      },
    }),
    prisma.staff.create({
      data: {
        name: 'James Chen',
        title: 'Hair Colorist',
        email: 'james@barberq.com',
        phone: '(555) 345-6789',
        bio: 'Specializes in coloring',
        displayOrder: 3,
        isActive: true,
        id: crypto.randomUUID(),
        updatedAt: new Date(),
      },
    }),
    prisma.staff.create({
      data: {
        name: 'Alex Williams',
        title: 'Barber',
        email: 'alex@barberq.com',
        phone: '(555) 456-7890',
        bio: 'Great with kids',
        displayOrder: 4,
        isActive: true,
        id: crypto.randomUUID(),
        updatedAt: new Date(),
      },
    }),
  ])

  // 4. Create Staff-Service Assignments
  console.log('🔗 Linking staff to services...')
  await Promise.all([
    // Marcus - Premium services
    prisma.staffService.create({ data: { id: crypto.randomUUID(), staffId: staff[0].id, serviceId: services[4].id, isPrimary: true, yearsExperience: 15 } }),
    prisma.staffService.create({ data: { id: crypto.randomUUID(), staffId: staff[0].id, serviceId: services[0].id, isPrimary: true, yearsExperience: 12 } }),
    prisma.staffService.create({ data: { id: crypto.randomUUID(), staffId: staff[0].id, serviceId: services[6].id, isPrimary: true, yearsExperience: 10 } }),
    // Diego - Classic and beard
    prisma.staffService.create({ data: { id: crypto.randomUUID(), staffId: staff[1].id, serviceId: services[0].id, isPrimary: true, yearsExperience: 10 } }),
    prisma.staffService.create({ data: { id: crypto.randomUUID(), staffId: staff[1].id, serviceId: services[2].id, isPrimary: true, yearsExperience: 10 } }),
    prisma.staffService.create({ data: { id: crypto.randomUUID(), staffId: staff[1].id, serviceId: services[5].id, isPrimary: true, yearsExperience: 8 } }),
    prisma.staffService.create({ data: { id: crypto.randomUUID(), staffId: staff[1].id, serviceId: services[6].id, isPrimary: true, yearsExperience: 9 } }),
    // James - Treatments
    prisma.staffService.create({ data: { id: crypto.randomUUID(), staffId: staff[2].id, serviceId: services[7].id, isPrimary: true, yearsExperience: 8 } }),
    prisma.staffService.create({ data: { id: crypto.randomUUID(), staffId: staff[2].id, serviceId: services[8].id, isPrimary: true, yearsExperience: 6 } }),
    prisma.staffService.create({ data: { id: crypto.randomUUID(), staffId: staff[2].id, serviceId: services[9].id, isPrimary: false, yearsExperience: 5 } }),
    // Alex - Basic services
    prisma.staffService.create({ data: { id: crypto.randomUUID(), staffId: staff[3].id, serviceId: services[3].id, isPrimary: true, yearsExperience: 5 } }),
    prisma.staffService.create({ data: { id: crypto.randomUUID(), staffId: staff[3].id, serviceId: services[1].id, isPrimary: true, yearsExperience: 4 } }),
    prisma.staffService.create({ data: { id: crypto.randomUUID(), staffId: staff[3].id, serviceId: services[0].id, isPrimary: false, yearsExperience: 4 } }),
  ])

  // 5. Create Customers with Different Patterns
  console.log('👥 Creating customers with various visit patterns...')
  const now = new Date()
  const ninetyDaysAgo = addDays(now, -90)
  const thirtyDaysAgo = addDays(now, -30)
  const sixtyDaysAgo = addDays(now, -60)

  // Regular monthly customers (for repeat visit insights)
  const regularCustomers = []
  for (let i = 0; i < 10; i++) {
    const customer = await prisma.customer.create({
      data: { updatedAt: new Date(), phone: `+9112345678${String(i).padStart(2, '0')}`, name: `Regular Customer ${i + 1}` },
    })
    regularCustomers.push(customer)
  }

  // Bi-monthly customers
  const biMonthlyCustomers = []
  for (let i = 0; i < 8; i++) {
    const customer = await prisma.customer.create({
      data: { updatedAt: new Date(), phone: `+9112345688${String(i).padStart(2, '0')}`, name: `BiMonthly Customer ${i + 1}` },
    })
    biMonthlyCustomers.push(customer)
  }

  // Quarterly customers
  const quarterlyCustomers = []
  for (let i = 0; i < 6; i++) {
    const customer = await prisma.customer.create({
      data: { updatedAt: new Date(), phone: `+9112345698${String(i).padStart(2, '0')}`, name: `Quarterly Customer ${i + 1}` },
    })
    quarterlyCustomers.push(customer)
  }

  // Inactive customers (30+ days) - for churn risk
  const inactive30Customers = []
  for (let i = 0; i < 5; i++) {
    const customer = await prisma.customer.create({
      data: { updatedAt: new Date(), phone: `+9112345708${String(i).padStart(2, '0')}`, name: `Inactive 30d Customer ${i + 1}` },
    })
    inactive30Customers.push(customer)
  }

  // Inactive customers (60+ days)
  const inactive60Customers = []
  for (let i = 0; i < 5; i++) {
    const customer = await prisma.customer.create({
      data: { updatedAt: new Date(), phone: `+9112345718${String(i).padStart(2, '0')}`, name: `Inactive 60d Customer ${i + 1}` },
    })
    inactive60Customers.push(customer)
  }

  // Inactive customers (90+ days) - high churn risk
  const inactive90Customers = []
  for (let i = 0; i < 5; i++) {
    const customer = await prisma.customer.create({
      data: { updatedAt: new Date(), phone: `+9112345728${String(i).padStart(2, '0')}`, name: `Inactive 90d Customer ${i + 1}` },
    })
    inactive90Customers.push(customer)
  }

  // Basic service only customers (for upsell opportunities)
  const basicOnlyCustomers = []
  for (let i = 0; i < 8; i++) {
    const customer = await prisma.customer.create({
      data: { updatedAt: new Date(), phone: `+9112345738${String(i).padStart(2, '0')}`, name: `Basic Only Customer ${i + 1}` },
    })
    basicOnlyCustomers.push(customer)
  }

  // High-value customers (for personalization)
  const highValueCustomers = []
  for (let i = 0; i < 5; i++) {
    const customer = await prisma.customer.create({
      data: { updatedAt: new Date(), phone: `+9112345748${String(i).padStart(2, '0')}`, name: `High Value Customer ${i + 1}` },
    })
    highValueCustomers.push(customer)
  }

  // New customers (for no-show risk)
  const newCustomers = []
  for (let i = 0; i < 5; i++) {
    const customer = await prisma.customer.create({
      data: { updatedAt: new Date(), phone: `+9112345758${String(i).padStart(2, '0')}`, name: `New Customer ${i + 1}` },
    })
    newCustomers.push(customer)
  }

  // 6. Generate Historical Walk-Ins (Last 90 Days)
  console.log('📅 Generating historical walk-ins (last 90 days)...')
  const allWalkIns = []

  // Regular customers - monthly visits
  for (const customer of regularCustomers) {
    const service = randomElement([services[0], services[4], services[6]]) // Mix of services
    const staffMember = randomElement(staff)
    let lastVisit = addDays(now, -30)
    
    for (let month = 0; month < 6; month++) {
      const visitDate = addDays(lastVisit, -month * 30 + randomInt(-5, 5))
      if (visitDate < ninetyDaysAgo) continue
      
      const createdAt = randomDate(
        new Date(visitDate.setHours(9, 0, 0, 0)),
        new Date(visitDate.setHours(17, 0, 0, 0))
      )
      const startedAt = new Date(createdAt.getTime() + randomInt(5, 15) * 60 * 1000)
      const completedAt = new Date(startedAt.getTime() + service.duration * 60 * 1000)

      allWalkIns.push({
        id: crypto.randomUUID(),
        customerId: customer.id,
        customerName: customer.name,
        service: service.name,
        staffId: staffMember.id,
        status: 'done',
        createdAt,
        startedAt,
        completedAt,
      })
    }
  }

  // Bi-monthly customers
  for (const customer of biMonthlyCustomers) {
    const service = randomElement([services[0], services[2], services[4]])
    const staffMember = randomElement(staff)
    let lastVisit = addDays(now, -60)
    
    for (let period = 0; period < 4; period++) {
      const visitDate = addDays(lastVisit, -period * 60 + randomInt(-7, 7))
      if (visitDate < ninetyDaysAgo) continue
      
      const createdAt = randomDate(
        new Date(visitDate.setHours(9, 0, 0, 0)),
        new Date(visitDate.setHours(17, 0, 0, 0))
      )
      const startedAt = new Date(createdAt.getTime() + randomInt(5, 15) * 60 * 1000)
      const completedAt = new Date(startedAt.getTime() + service.duration * 60 * 1000)

      allWalkIns.push({
        id: crypto.randomUUID(),
        customerId: customer.id,
        customerName: customer.name,
        service: service.name,
        staffId: staffMember.id,
        status: 'done',
        createdAt,
        startedAt,
        completedAt,
      })
    }
  }

  // Quarterly customers
  for (const customer of quarterlyCustomers) {
    const service = randomElement([services[0], services[5], services[7]])
    const staffMember = randomElement(staff)
    
    for (let quarter = 0; quarter < 3; quarter++) {
      const visitDate = addDays(now, -quarter * 90 + randomInt(-10, 10))
      if (visitDate < ninetyDaysAgo) continue
      
      const createdAt = randomDate(
        new Date(visitDate.setHours(9, 0, 0, 0)),
        new Date(visitDate.setHours(17, 0, 0, 0))
      )
      const startedAt = new Date(createdAt.getTime() + randomInt(5, 15) * 60 * 1000)
      const completedAt = new Date(startedAt.getTime() + service.duration * 60 * 1000)

      allWalkIns.push({
        id: crypto.randomUUID(),
        customerId: customer.id,
        customerName: customer.name,
        service: service.name,
        staffId: staffMember.id,
        status: 'done',
        createdAt,
        startedAt,
        completedAt,
      })
    }
  }

  // Inactive 30 days customers - last visit 30-40 days ago
  for (const customer of inactive30Customers) {
    const service = randomElement([services[0], services[2]])
    const staffMember = randomElement(staff)
    const visitDate = addDays(now, -randomInt(30, 40))
    
    const createdAt = randomDate(
      new Date(visitDate.setHours(9, 0, 0, 0)),
      new Date(visitDate.setHours(17, 0, 0, 0))
    )
    const startedAt = new Date(createdAt.getTime() + randomInt(5, 15) * 60 * 1000)
    const completedAt = new Date(startedAt.getTime() + service.duration * 60 * 1000)

    allWalkIns.push({
      id: crypto.randomUUID(),
      customerId: customer.id,
      customerName: customer.name,
      service: service.name,
      staffId: staffMember.id,
      status: 'done',
      createdAt,
      startedAt,
      completedAt,
    })
  }

  // Inactive 60 days customers
  for (const customer of inactive60Customers) {
    const service = randomElement([services[0], services[4]])
    const staffMember = randomElement(staff)
    const visitDate = addDays(now, -randomInt(60, 70))
    
    const createdAt = randomDate(
      new Date(visitDate.setHours(9, 0, 0, 0)),
      new Date(visitDate.setHours(17, 0, 0, 0))
    )
    const startedAt = new Date(createdAt.getTime() + randomInt(5, 15) * 60 * 1000)
    const completedAt = new Date(startedAt.getTime() + service.duration * 60 * 1000)

    allWalkIns.push({
      id: crypto.randomUUID(),
      customerId: customer.id,
      customerName: customer.name,
      service: service.name,
      staffId: staffMember.id,
      status: 'done',
      createdAt,
      startedAt,
      completedAt,
    })
  }

  // Inactive 90+ days customers - high churn risk
  for (const customer of inactive90Customers) {
    const service = randomElement([services[0], services[4], services[6]])
    const staffMember = randomElement(staff)
    const visitDate = addDays(now, -randomInt(90, 120))
    
    const createdAt = randomDate(
      new Date(visitDate.setHours(9, 0, 0, 0)),
      new Date(visitDate.setHours(17, 0, 0, 0))
    )
    const startedAt = new Date(createdAt.getTime() + randomInt(5, 15) * 60 * 1000)
    const completedAt = new Date(startedAt.getTime() + service.duration * 60 * 1000)

    allWalkIns.push({
      id: crypto.randomUUID(),
      customerId: customer.id,
      customerName: customer.name,
      service: service.name,
      staffId: staffMember.id,
      status: 'done',
      createdAt,
      startedAt,
      completedAt,
    })
  }

  // Basic service only customers - only book basic services (for upsell)
  for (const customer of basicOnlyCustomers) {
    const basicServices = [services[0], services[1], services[2], services[3]] // Only basic
    const service = randomElement(basicServices)
    const staffMember = randomElement(staff)
    
    // Create 3-5 visits with only basic services
    for (let visit = 0; visit < randomInt(3, 5); visit++) {
      const visitDate = addDays(now, -randomInt(10, 90))
      if (visitDate < ninetyDaysAgo) continue
      
      const createdAt = randomDate(
        new Date(visitDate.setHours(9, 0, 0, 0)),
        new Date(visitDate.setHours(17, 0, 0, 0))
      )
      const startedAt = new Date(createdAt.getTime() + randomInt(5, 15) * 60 * 1000)
      const completedAt = new Date(startedAt.getTime() + service.duration * 60 * 1000)

      allWalkIns.push({
        id: crypto.randomUUID(),
        customerId: customer.id,
        customerName: customer.name,
        service: service.name,
        staffId: staffMember.id,
        status: 'done',
        createdAt,
        startedAt,
        completedAt,
      })
    }
  }

  // High-value customers - book premium services frequently
  for (const customer of highValueCustomers) {
    const premiumServices = [services[4], services[5], services[6], services[7], services[8]]
    const service = randomElement(premiumServices)
    const staffMember = randomElement(staff)
    
    for (let visit = 0; visit < randomInt(8, 12); visit++) {
      const visitDate = addDays(now, -randomInt(5, 90))
      if (visitDate < ninetyDaysAgo) continue
      
      const createdAt = randomDate(
        new Date(visitDate.setHours(9, 0, 0, 0)),
        new Date(visitDate.setHours(17, 0, 0, 0))
      )
      const startedAt = new Date(createdAt.getTime() + randomInt(5, 15) * 60 * 1000)
      const completedAt = new Date(startedAt.getTime() + service.duration * 60 * 1000)

      allWalkIns.push({
        id: crypto.randomUUID(),
        customerId: customer.id,
        customerName: customer.name,
        service: service.name,
        staffId: staffMember.id,
        status: 'done',
        createdAt,
        startedAt,
        completedAt,
      })
    }
  }

  // New customers - 1-2 visits (for no-show risk)
  for (const customer of newCustomers) {
    const service = randomElement(services)
    const staffMember = randomElement(staff)
    const visitDate = addDays(now, -randomInt(1, 14))
    
    const createdAt = randomDate(
      new Date(visitDate.setHours(9, 0, 0, 0)),
      new Date(visitDate.setHours(17, 0, 0, 0))
    )
    const startedAt = new Date(createdAt.getTime() + randomInt(5, 15) * 60 * 1000)
    const completedAt = new Date(startedAt.getTime() + service.duration * 60 * 1000)

    allWalkIns.push({
      id: crypto.randomUUID(),
      customerId: customer.id,
      customerName: customer.name,
      service: service.name,
      staffId: staffMember.id,
      status: 'done',
      createdAt,
      startedAt,
      completedAt,
    })
  }

  // Generate walk-ins across different days/hours for slot optimization
  console.log('⏰ Generating walk-ins across different time slots...')
  for (let day = 0; day < 90; day++) {
    const date = addDays(now, -day)
    const dayOfWeek = date.getDay()
    
    // More bookings on weekends (Friday, Saturday)
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6
    const bookingCount = isWeekend ? randomInt(8, 15) : randomInt(5, 12)
    
    for (let booking = 0; booking < bookingCount; booking++) {
      const hour = randomInt(9, 17) // 9 AM to 5 PM
      const customer = await prisma.customer.create({
        data: { 
          phone: `+9112345${String(day).padStart(3, '0')}${String(booking).padStart(2, '0')}`, 
          name: `Walk-in Customer ${day}-${booking}`,
          updatedAt: new Date(),
        },
      })
      
      const service = randomElement(services)
      const staffMember = randomElement(staff)
      
      const createdAt = new Date(date)
      createdAt.setHours(hour, randomInt(0, 59), 0, 0)
      
      const startedAt = new Date(createdAt.getTime() + randomInt(5, 15) * 60 * 1000)
      const completedAt = new Date(startedAt.getTime() + service.duration * 60 * 1000)

      allWalkIns.push({
        id: crypto.randomUUID(),
        customerId: customer.id,
        customerName: customer.name,
        service: service.name,
        staffId: staffMember.id,
        status: 'done',
        createdAt,
        startedAt,
        completedAt,
      })
    }
  }

  // Add some incomplete visits (for no-show risk analysis)
  console.log('⚠️ Adding incomplete visits (no-show risk)...')
  for (let i = 0; i < 10; i++) {
    const customer = await prisma.customer.create({
      data: { 
        phone: `+9112345999${String(i).padStart(2, '0')}`, 
        name: `No-show Risk Customer ${i + 1}`,
        updatedAt: new Date(),
      },
    })
    
    const service = randomElement(services)
    const staffMember = randomElement(staff)
    const visitDate = addDays(now, -randomInt(1, 30))
    
    const createdAt = randomDate(
      new Date(visitDate.setHours(9, 0, 0, 0)),
      new Date(visitDate.setHours(17, 0, 0, 0))
    )
    const startedAt = new Date(createdAt.getTime() + randomInt(5, 15) * 60 * 1000)
    // No completedAt - service started but not finished

    allWalkIns.push({
      id: crypto.randomUUID(),
      customerId: customer.id,
      customerName: customer.name,
      service: service.name,
      staffId: staffMember.id,
      status: 'in-progress', // Stuck in progress
      createdAt,
      startedAt,
      completedAt: null,
    })
  }

  // Service combinations - customers who book services together
  console.log('📦 Creating service combination patterns...')
  for (let i = 0; i < 10; i++) {
    const customer = await prisma.customer.create({
      data: { 
        phone: `+9112345888${String(i).padStart(2, '0')}`, 
        name: `Combo Customer ${i + 1}`,
        updatedAt: new Date(),
      },
    })
    
    // Book Classic Haircut + Beard Trim together (within 7 days)
    const firstService = services[0] // Classic Haircut
    const secondService = services[2] // Beard Trim
    const staffMember = randomElement(staff)
    
    const firstDate = addDays(now, -randomInt(10, 30))
    const secondDate = addDays(firstDate, randomInt(1, 7)) // Within 7 days
    
    // First service
    const createdAt1 = randomDate(
      new Date(firstDate.setHours(9, 0, 0, 0)),
      new Date(firstDate.setHours(17, 0, 0, 0))
    )
    const startedAt1 = new Date(createdAt1.getTime() + randomInt(5, 15) * 60 * 1000)
    const completedAt1 = new Date(startedAt1.getTime() + firstService.duration * 60 * 1000)

    allWalkIns.push({
      id: crypto.randomUUID(),
      customerId: customer.id,
      customerName: customer.name,
      service: firstService.name,
      staffId: staffMember.id,
      status: 'done',
      createdAt: createdAt1,
      startedAt: startedAt1,
      completedAt: completedAt1,
    })

    // Second service
    const createdAt2 = randomDate(
      new Date(secondDate.setHours(9, 0, 0, 0)),
      new Date(secondDate.setHours(17, 0, 0, 0))
    )
    const startedAt2 = new Date(createdAt2.getTime() + randomInt(5, 15) * 60 * 1000)
    const completedAt2 = new Date(startedAt2.getTime() + secondService.duration * 60 * 1000)

    allWalkIns.push({
      id: crypto.randomUUID(),
      customerId: customer.id,
      customerName: customer.name,
      service: secondService.name,
      staffId: staffMember.id,
      status: 'done',
      createdAt: createdAt2,
      startedAt: startedAt2,
      completedAt: completedAt2,
    })
  }

  // Insert all walk-ins in batches
  console.log(`💾 Inserting ${allWalkIns.length} walk-ins...`)
  const batchSize = 100
  for (let i = 0; i < allWalkIns.length; i += batchSize) {
    const batch = allWalkIns.slice(i, i + batchSize)
    await prisma.walkIn.createMany({ data: batch })
    console.log(`   Inserted ${Math.min(i + batchSize, allWalkIns.length)}/${allWalkIns.length} walk-ins`)
  }

  // 7. Create Current Queue Items
  console.log('🚶 Creating current queue items...')
  const currentCustomers = []
  for (let i = 0; i < 5; i++) {
    const customer = await prisma.customer.create({
      data: { 
        phone: `+9112345777${String(i).padStart(2, '0')}`, 
        name: `Current Customer ${i + 1}`,
        updatedAt: new Date() 
      },
    })
    currentCustomers.push(customer)
  }

  await Promise.all([
    // In progress
    prisma.walkIn.create({
      data: {
        id: crypto.randomUUID(),
        customerId: currentCustomers[0].id,
        customerName: currentCustomers[0].name,
        service: services[4].name,
        staffId: staff[0].id,
        status: 'in-progress',
        createdAt: addDays(now, 0),
        startedAt: addDays(now, 0),
      },
    }),
    prisma.walkIn.create({
      data: {
        id: crypto.randomUUID(),
        customerId: currentCustomers[1].id,
        customerName: currentCustomers[1].name,
        service: services[0].name,
        staffId: staff[1].id,
        status: 'in-progress',
        createdAt: addDays(now, 0),
        startedAt: addDays(now, 0),
      },
    }),
    // Waiting
    prisma.walkIn.create({
      data: {
        id: crypto.randomUUID(),
        customerId: currentCustomers[2].id,
        customerName: currentCustomers[2].name,
        service: services[2].name,
        status: 'waiting',
        createdAt: addDays(now, 0),
      },
    }),
    prisma.walkIn.create({
      data: {
        id: crypto.randomUUID(),
        customerId: currentCustomers[3].id,
        customerName: currentCustomers[3].name,
        service: services[1].name,
        status: 'waiting',
        createdAt: addDays(now, 0),
      },
    }),
    prisma.walkIn.create({
      data: {
        id: crypto.randomUUID(),
        customerId: currentCustomers[4].id,
        customerName: currentCustomers[4].name,
        service: services[3].name,
        status: 'waiting',
        createdAt: addDays(now, 0),
      },
    }),
  ])

  const totalCustomers = 
    regularCustomers.length +
    biMonthlyCustomers.length +
    quarterlyCustomers.length +
    inactive30Customers.length +
    inactive60Customers.length +
    inactive90Customers.length +
    basicOnlyCustomers.length +
    highValueCustomers.length +
    newCustomers.length +
    currentCustomers.length +
    10 + // combo customers
    10 + // no-show risk
    90 * 12 // walk-in customers (approx)

  console.log(`
✅ Comprehensive seed completed successfully!

📊 Created:
   - ${categories.length} Categories
   - ${services.length} Services (${services.filter(s => s.price <= 30).length} basic, ${services.filter(s => s.price > 30).length} premium)
   - ${staff.length} Staff Members
   - ~${totalCustomers} Customers
   - ${allWalkIns.length} Historical Walk-Ins
   - 5 Current Queue Items

💡 Data Patterns for Insights Testing:
   ✅ Churn Risk: ${inactive30Customers.length + inactive60Customers.length + inactive90Customers.length} inactive customers (30/60/90+ days)
   ✅ Upsell Opportunities: ${basicOnlyCustomers.length} customers only booking basic services
   ✅ Repeat Visits: ${regularCustomers.length} monthly + ${biMonthlyCustomers.length} bi-monthly + ${quarterlyCustomers.length} quarterly
   ✅ No-Show Risk: 10 incomplete visits + ${newCustomers.length} new customers
   ✅ Service Combinations: 10 customers booking services together
   ✅ Time Distribution: Walk-ins across 90 days, different hours/days
   ✅ Staff Performance: ${staff.length} staff with varying service assignments
   ✅ Revenue Trends: Mix of basic/premium services across time periods

🎯 All insights should now have sufficient data to generate meaningful results!
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
