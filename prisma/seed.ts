// @cursor: Seed script to populate demo data for BarberQ MVP
// Creates realistic test data: Categories, Services, Staff, and WalkIns

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

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
        name: 'Haircuts',
        description: 'Classic and modern haircut styles',
        icon: 'Scissors',
        displayOrder: 1,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Beard & Shave',
        description: 'Grooming services for facial hair',
        icon: 'Sparkles',
        displayOrder: 2,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Hair Treatments',
        description: 'Professional hair care treatments',
        icon: 'Droplet',
        displayOrder: 3,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Styling',
        description: 'Special occasion styling services',
        icon: 'Sparkle',
        displayOrder: 4,
        isActive: true,
      },
    }),
  ])

  // 2. Create Services
  console.log('✂️ Creating services...')
  const services = await Promise.all([
    // Haircuts
    prisma.service.create({
      data: {
        name: 'Classic Haircut',
        price: 35,
        duration: 30,
        description: 'Traditional haircut with clippers and scissors',
        categoryId: categories[0].id,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Premium Fade',
        price: 45,
        duration: 45,
        description: 'High-quality fade with detailed styling',
        categoryId: categories[0].id,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Buzz Cut',
        price: 25,
        duration: 20,
        description: 'Quick and clean buzz cut',
        categoryId: categories[0].id,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Kids Haircut',
        price: 28,
        duration: 25,
        description: 'Haircut for children under 12',
        categoryId: categories[0].id,
        isActive: true,
      },
    }),
    // Beard & Shave
    prisma.service.create({
      data: {
        name: 'Beard Trim',
        price: 20,
        duration: 20,
        description: 'Professional beard shaping and trimming',
        categoryId: categories[1].id,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Hot Towel Shave',
        price: 40,
        duration: 35,
        description: 'Luxury straight razor shave with hot towels',
        categoryId: categories[1].id,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Beard & Haircut Combo',
        price: 55,
        duration: 50,
        description: 'Complete haircut and beard grooming',
        categoryId: categories[1].id,
        isActive: true,
      },
    }),
    // Hair Treatments
    prisma.service.create({
      data: {
        name: 'Hair Coloring',
        price: 80,
        duration: 90,
        description: 'Professional hair coloring service',
        categoryId: categories[2].id,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Scalp Treatment',
        price: 50,
        duration: 40,
        description: 'Deep cleansing scalp massage and treatment',
        categoryId: categories[2].id,
        isActive: true,
      },
    }),
    // Styling
    prisma.service.create({
      data: {
        name: 'Hair Styling',
        price: 35,
        duration: 30,
        description: 'Professional styling for events',
        categoryId: categories[3].id,
        isActive: true,
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
        bio: '15 years of experience specializing in fades and modern styles',
        displayOrder: 1,
        isActive: true,
      },
    }),
    prisma.staff.create({
      data: {
        name: 'Diego Rodriguez',
        title: 'Senior Stylist',
        email: 'diego@barberq.com',
        phone: '(555) 234-5678',
        bio: 'Expert in classic cuts and beard grooming',
        displayOrder: 2,
        isActive: true,
      },
    }),
    prisma.staff.create({
      data: {
        name: 'James Chen',
        title: 'Hair Colorist',
        email: 'james@barberq.com',
        phone: '(555) 345-6789',
        bio: 'Specializes in hair coloring and treatments',
        displayOrder: 3,
        isActive: true,
      },
    }),
    prisma.staff.create({
      data: {
        name: 'Alex Williams',
        title: 'Barber',
        email: 'alex@barberq.com',
        phone: '(555) 456-7890',
        bio: 'Great with kids and classic styles',
        displayOrder: 4,
        isActive: true,
      },
    }),
  ])

  // 4. Create Staff-Service Assignments
  console.log('🔗 Linking staff to services...')
  await Promise.all([
    // Marcus - Specializes in Haircuts and Fades
    prisma.staffService.create({
      data: {
        staffId: staff[0].id,
        serviceId: services[0].id, // Classic Haircut
        isPrimary: true,
        yearsExperience: 15,
      },
    }),
    prisma.staffService.create({
      data: {
        staffId: staff[0].id,
        serviceId: services[1].id, // Premium Fade
        isPrimary: true,
        yearsExperience: 12,
      },
    }),
    prisma.staffService.create({
      data: {
        staffId: staff[0].id,
        serviceId: services[4].id, // Beard Trim
        isPrimary: false,
        yearsExperience: 10,
      },
    }),

    // Diego - Classic cuts and beard
    prisma.staffService.create({
      data: {
        staffId: staff[1].id,
        serviceId: services[0].id, // Classic Haircut
        isPrimary: true,
        yearsExperience: 10,
      },
    }),
    prisma.staffService.create({
      data: {
        staffId: staff[1].id,
        serviceId: services[4].id, // Beard Trim
        isPrimary: true,
        yearsExperience: 10,
      },
    }),
    prisma.staffService.create({
      data: {
        staffId: staff[1].id,
        serviceId: services[5].id, // Hot Towel Shave
        isPrimary: true,
        yearsExperience: 8,
      },
    }),
    prisma.staffService.create({
      data: {
        staffId: staff[1].id,
        serviceId: services[6].id, // Beard & Haircut Combo
        isPrimary: true,
        yearsExperience: 9,
      },
    }),

    // James - Hair treatments specialist
    prisma.staffService.create({
      data: {
        staffId: staff[2].id,
        serviceId: services[7].id, // Hair Coloring
        isPrimary: true,
        yearsExperience: 8,
      },
    }),
    prisma.staffService.create({
      data: {
        staffId: staff[2].id,
        serviceId: services[8].id, // Scalp Treatment
        isPrimary: true,
        yearsExperience: 6,
      },
    }),
    prisma.staffService.create({
      data: {
        staffId: staff[2].id,
        serviceId: services[9].id, // Hair Styling
        isPrimary: false,
        yearsExperience: 5,
      },
    }),

    // Alex - All-rounder, great with kids
    prisma.staffService.create({
      data: {
        staffId: staff[3].id,
        serviceId: services[3].id, // Kids Haircut
        isPrimary: true,
        yearsExperience: 5,
      },
    }),
    prisma.staffService.create({
      data: {
        staffId: staff[3].id,
        serviceId: services[2].id, // Buzz Cut
        isPrimary: true,
        yearsExperience: 4,
      },
    }),
    prisma.staffService.create({
      data: {
        staffId: staff[3].id,
        serviceId: services[0].id, // Classic Haircut
        isPrimary: false,
        yearsExperience: 4,
      },
    }),
  ])

  // 5. Create Customers with Historical Visits
  console.log('👥 Creating customers with visit history...')
  const now = new Date()
  
  // Helper function to create historical visits
  const createHistoricalVisits = (
    customerId: string,
    customerName: string,
    serviceName: string,
    staffId: string | null,
    monthsBack: number,
    intervalMonths: number,
    serviceDuration: number
  ) => {
    const visits = []
    const today = new Date()
    
    for (let i = 0; i < monthsBack; i += intervalMonths) {
      const visitDate = new Date(today)
      visitDate.setMonth(today.getMonth() - i)
      // Randomize day of month (1-28 to avoid month-end issues)
      visitDate.setDate(Math.floor(Math.random() * 28) + 1)
      // Randomize time (9 AM - 5 PM)
      visitDate.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0)
      
      const createdAt = new Date(visitDate)
      const startedAt = new Date(visitDate.getTime() + 5 * 60 * 1000) // Started 5 mins after arrival
      const completedAt = new Date(startedAt.getTime() + serviceDuration * 60 * 1000)
      
      visits.push({
        customerId,
        customerName,
        service: serviceName,
        staffId,
        status: 'done',
        createdAt,
        startedAt,
        completedAt,
      })
    }
    
    return visits
  }
  
  // Create customers with different visit frequencies
  
  // Monthly regular customers (visit every month for past 8-12 months)
  const monthlyCustomer1 = await prisma.customer.create({
    data: { phone: '+911234567890', name: 'Rajesh Kumar' },
  })
  const monthlyCustomer2 = await prisma.customer.create({
    data: { phone: '+911234567891', name: 'Priya Sharma' },
  })
  const monthlyCustomer3 = await prisma.customer.create({
    data: { phone: '+911234567892', name: 'Amit Patel' },
  })
  const monthlyCustomer4 = await prisma.customer.create({
    data: { phone: '+911234567898', name: 'Ravi Nair' },
  })
  const monthlyCustomer5 = await prisma.customer.create({
    data: { phone: '+911234567899', name: 'Sunita Desai' },
  })
  const monthlyCustomer6 = await prisma.customer.create({
    data: { phone: '+911234567900', name: 'Mohammed Ali' },
  })
  const monthlyCustomer7 = await prisma.customer.create({
    data: { phone: '+911234567901', name: 'Kavita Joshi' },
  })
  
  // Bi-monthly customers (visit every 2 months for past 10-12 months = 5-6 visits)
  const biMonthlyCustomer1 = await prisma.customer.create({
    data: { phone: '+911234567893', name: 'Vikram Singh' },
  })
  const biMonthlyCustomer2 = await prisma.customer.create({
    data: { phone: '+911234567894', name: 'Anjali Mehta' },
  })
  const biMonthlyCustomer3 = await prisma.customer.create({
    data: { phone: '+911234567902', name: 'Arjun Kapoor' },
  })
  const biMonthlyCustomer4 = await prisma.customer.create({
    data: { phone: '+911234567903', name: 'Meera Iyer' },
  })
  const biMonthlyCustomer5 = await prisma.customer.create({
    data: { phone: '+911234567904', name: 'Suresh Menon' },
  })
  
  // Quarterly customers (visit every 3 months)
  const quarterlyCustomer1 = await prisma.customer.create({
    data: { phone: '+911234567905', name: 'Neha Gupta' },
  })
  const quarterlyCustomer2 = await prisma.customer.create({
    data: { phone: '+911234567906', name: 'Rohit Agarwal' },
  })
  const quarterlyCustomer3 = await prisma.customer.create({
    data: { phone: '+911234567907', name: 'Pooja Shah' },
  })
  
  // Rare customers (1-2 visits in past year)
  const rareCustomer1 = await prisma.customer.create({
    data: { phone: '+911234567895', name: 'Deepak Verma' },
  })
  const rareCustomer2 = await prisma.customer.create({
    data: { phone: '+911234567896', name: 'Sneha Reddy' },
  })
  const rareCustomer3 = await prisma.customer.create({
    data: { phone: '+911234567897', name: 'Karan Malhotra' },
  })
  const rareCustomer4 = await prisma.customer.create({
    data: { phone: '+911234567908', name: 'Aditya Rao' },
  })
  const rareCustomer5 = await prisma.customer.create({
    data: { phone: '+911234567909', name: 'Divya Nair' },
  })
  const rareCustomer6 = await prisma.customer.create({
    data: { phone: '+911234567910', name: 'Varun Krishnan' },
  })
  const rareCustomer7 = await prisma.customer.create({
    data: { phone: '+911234567911', name: 'Lakshmi Pillai' },
  })
  const rareCustomer8 = await prisma.customer.create({
    data: { phone: '+911234567912', name: 'Gaurav Chawla' },
  })
  
  // Create historical visits for monthly customers
  console.log('📅 Creating monthly visit history...')
  const monthlyVisits1 = createHistoricalVisits(
    monthlyCustomer1.id, monthlyCustomer1.name, 'Premium Fade', staff[0].id, 8, 1, 45
  )
  const monthlyVisits2 = createHistoricalVisits(
    monthlyCustomer2.id, monthlyCustomer2.name, 'Classic Haircut', staff[1].id, 8, 1, 30
  )
  const monthlyVisits3 = createHistoricalVisits(
    monthlyCustomer3.id, monthlyCustomer3.name, 'Beard & Haircut Combo', staff[1].id, 8, 1, 50
  )
  const monthlyVisits4 = createHistoricalVisits(
    monthlyCustomer4.id, monthlyCustomer4.name, 'Classic Haircut', staff[0].id, 10, 1, 30
  )
  const monthlyVisits5 = createHistoricalVisits(
    monthlyCustomer5.id, monthlyCustomer5.name, 'Hair Styling', staff[2].id, 9, 1, 30
  )
  const monthlyVisits6 = createHistoricalVisits(
    monthlyCustomer6.id, monthlyCustomer6.name, 'Premium Fade', staff[0].id, 12, 1, 45
  )
  const monthlyVisits7 = createHistoricalVisits(
    monthlyCustomer7.id, monthlyCustomer7.name, 'Beard Trim', staff[1].id, 7, 1, 20
  )
  
  // Create historical visits for bi-monthly customers
  console.log('📅 Creating bi-monthly visit history...')
  const biMonthlyVisits1 = createHistoricalVisits(
    biMonthlyCustomer1.id, biMonthlyCustomer1.name, 'Classic Haircut', staff[0].id, 10, 2, 30
  )
  const biMonthlyVisits2 = createHistoricalVisits(
    biMonthlyCustomer2.id, biMonthlyCustomer2.name, 'Hair Styling', staff[2].id, 10, 2, 30
  )
  const biMonthlyVisits3 = createHistoricalVisits(
    biMonthlyCustomer3.id, biMonthlyCustomer3.name, 'Premium Fade', staff[0].id, 12, 2, 45
  )
  const biMonthlyVisits4 = createHistoricalVisits(
    biMonthlyCustomer4.id, biMonthlyCustomer4.name, 'Beard & Haircut Combo', staff[1].id, 10, 2, 50
  )
  const biMonthlyVisits5 = createHistoricalVisits(
    biMonthlyCustomer5.id, biMonthlyCustomer5.name, 'Classic Haircut', staff[1].id, 8, 2, 30
  )
  
  // Create historical visits for quarterly customers
  console.log('📅 Creating quarterly visit history...')
  const quarterlyVisits1 = createHistoricalVisits(
    quarterlyCustomer1.id, quarterlyCustomer1.name, 'Hair Coloring', staff[2].id, 12, 3, 90
  )
  const quarterlyVisits2 = createHistoricalVisits(
    quarterlyCustomer2.id, quarterlyCustomer2.name, 'Classic Haircut', staff[0].id, 9, 3, 30
  )
  const quarterlyVisits3 = createHistoricalVisits(
    quarterlyCustomer3.id, quarterlyCustomer3.name, 'Hot Towel Shave', staff[1].id, 12, 3, 35
  )
  
  // Create rare visits (1-2 visits in past year)
  console.log('📅 Creating rare visit history...')
  const rareVisits1 = createHistoricalVisits(
    rareCustomer1.id, rareCustomer1.name, 'Hot Towel Shave', staff[1].id, 8, 8, 35
  )
  const rareVisits2a = createHistoricalVisits(
    rareCustomer2.id, rareCustomer2.name, 'Hair Coloring', staff[2].id, 6, 6, 90
  )
  const rareVisits2b = createHistoricalVisits(
    rareCustomer2.id, rareCustomer2.name, 'Hair Coloring', staff[2].id, 2, 2, 90
  )
  const rareVisits3 = createHistoricalVisits(
    rareCustomer3.id, rareCustomer3.name, 'Buzz Cut', staff[3].id, 10, 10, 20
  )
  const rareVisits4 = createHistoricalVisits(
    rareCustomer4.id, rareCustomer4.name, 'Classic Haircut', staff[0].id, 11, 11, 30
  )
  const rareVisits5a = createHistoricalVisits(
    rareCustomer5.id, rareCustomer5.name, 'Scalp Treatment', staff[2].id, 7, 7, 40
  )
  const rareVisits5b = createHistoricalVisits(
    rareCustomer5.id, rareCustomer5.name, 'Hair Styling', staff[2].id, 3, 3, 30
  )
  const rareVisits6 = createHistoricalVisits(
    rareCustomer6.id, rareCustomer6.name, 'Beard Trim', staff[1].id, 9, 9, 20
  )
  const rareVisits7 = createHistoricalVisits(
    rareCustomer7.id, rareCustomer7.name, 'Kids Haircut', staff[3].id, 6, 6, 25
  )
  const rareVisits8 = createHistoricalVisits(
    rareCustomer8.id, rareCustomer8.name, 'Premium Fade', staff[0].id, 5, 5, 45
  )
  
  // Insert all historical visits
  const allHistoricalVisits = [
    ...monthlyVisits1,
    ...monthlyVisits2,
    ...monthlyVisits3,
    ...monthlyVisits4,
    ...monthlyVisits5,
    ...monthlyVisits6,
    ...monthlyVisits7,
    ...biMonthlyVisits1,
    ...biMonthlyVisits2,
    ...biMonthlyVisits3,
    ...biMonthlyVisits4,
    ...biMonthlyVisits5,
    ...quarterlyVisits1,
    ...quarterlyVisits2,
    ...quarterlyVisits3,
    ...rareVisits1,
    ...rareVisits2a,
    ...rareVisits2b,
    ...rareVisits3,
    ...rareVisits4,
    ...rareVisits5a,
    ...rareVisits5b,
    ...rareVisits6,
    ...rareVisits7,
    ...rareVisits8,
  ]
  
  await prisma.walkIn.createMany({
    data: allHistoricalVisits,
  })

  // 6. Create Current Walk-Ins (Queue Data)
  console.log('🚶 Creating current walk-in customers...')
  
  // Create customers for current walk-ins
  const currentCustomer1 = await prisma.customer.create({
    data: { phone: '+911234567913', name: 'Michael Johnson' },
  })
  const currentCustomer2 = await prisma.customer.create({
    data: { phone: '+911234567914', name: 'Sarah Martinez' },
  })
  const currentCustomer3 = await prisma.customer.create({
    data: { phone: '+911234567915', name: 'David Lee' },
  })
  const currentCustomer4 = await prisma.customer.create({
    data: { phone: '+911234567916', name: 'Tommy Anderson' },
  })
  const currentCustomer5 = await prisma.customer.create({
    data: { phone: '+911234567917', name: 'Robert Wilson' },
  })
  const currentCustomer6 = await prisma.customer.create({
    data: { phone: '+911234567918', name: 'Chris Brown' },
  })
  const currentCustomer7 = await prisma.customer.create({
    data: { phone: '+911234567919', name: 'Jason Taylor' },
  })
  const currentCustomer8 = await prisma.customer.create({
    data: { phone: '+911234567920', name: 'Kevin White' },
  })
  const currentCustomer9 = await prisma.customer.create({
    data: { phone: '+911234567921', name: 'Daniel Harris' },
  })
  
  const walkIns = await Promise.all([
    // Currently being served
    prisma.walkIn.create({
      data: {
        customerId: currentCustomer1.id,
        customerName: 'Michael Johnson',
        service: 'Premium Fade',
        staffId: staff[0].id,
        status: 'in-progress',
        notes: 'Wants a skin fade with textured top',
        createdAt: new Date(now.getTime() - 25 * 60 * 1000), // 25 mins ago
        startedAt: new Date(now.getTime() - 10 * 60 * 1000), // Started 10 mins ago
      },
    }),
    prisma.walkIn.create({
      data: {
        customerId: currentCustomer2.id,
        customerName: 'Sarah Martinez',
        service: 'Hair Coloring',
        staffId: staff[2].id,
        status: 'in-progress',
        notes: 'Ash blonde highlights',
        createdAt: new Date(now.getTime() - 50 * 60 * 1000), // 50 mins ago
        startedAt: new Date(now.getTime() - 35 * 60 * 1000), // Started 35 mins ago
      },
    }),

    // Waiting in queue
    prisma.walkIn.create({
      data: {
        customerId: currentCustomer3.id,
        customerName: 'David Lee',
        service: 'Classic Haircut',
        staffId: staff[1].id,
        status: 'waiting',
        notes: 'Regular customer, knows the style',
        createdAt: new Date(now.getTime() - 8 * 60 * 1000), // 8 mins ago
      },
    }),
    prisma.walkIn.create({
      data: {
        customerId: currentCustomer4.id,
        customerName: 'Tommy Anderson',
        service: 'Kids Haircut',
        staffId: staff[3].id,
        status: 'waiting',
        notes: 'First time, age 7',
        createdAt: new Date(now.getTime() - 5 * 60 * 1000), // 5 mins ago
      },
    }),
    prisma.walkIn.create({
      data: {
        customerId: currentCustomer5.id,
        customerName: 'Robert Wilson',
        service: 'Beard & Haircut Combo',
        status: 'waiting',
        notes: 'No rush, wants full service',
        createdAt: new Date(now.getTime() - 3 * 60 * 1000), // 3 mins ago
      },
    }),
    prisma.walkIn.create({
      data: {
        customerId: currentCustomer6.id,
        customerName: 'Chris Brown',
        service: 'Buzz Cut',
        status: 'waiting',
        notes: 'Quick trim, #2 all over',
        createdAt: new Date(now.getTime() - 2 * 60 * 1000), // 2 mins ago
      },
    }),

    // Recently completed (for analytics)
    prisma.walkIn.create({
      data: {
        customerId: currentCustomer7.id,
        customerName: 'Jason Taylor',
        service: 'Hot Towel Shave',
        staffId: staff[1].id,
        status: 'done',
        notes: 'Very satisfied, tipped well',
        createdAt: new Date(now.getTime() - 90 * 60 * 1000), // 90 mins ago
        startedAt: new Date(now.getTime() - 85 * 60 * 1000),
        completedAt: new Date(now.getTime() - 60 * 60 * 1000), // Completed 60 mins ago
      },
    }),
    prisma.walkIn.create({
      data: {
        customerId: currentCustomer8.id,
        customerName: 'Kevin White',
        service: 'Premium Fade',
        staffId: staff[0].id,
        status: 'done',
        createdAt: new Date(now.getTime() - 120 * 60 * 1000), // 2 hours ago
        startedAt: new Date(now.getTime() - 115 * 60 * 1000),
        completedAt: new Date(now.getTime() - 90 * 60 * 1000), // Completed 90 mins ago
      },
    }),
    prisma.walkIn.create({
      data: {
        customerId: currentCustomer9.id,
        customerName: 'Daniel Harris',
        service: 'Beard Trim',
        staffId: staff[0].id,
        status: 'done',
        createdAt: new Date(now.getTime() - 135 * 60 * 1000),
        startedAt: new Date(now.getTime() - 130 * 60 * 1000),
        completedAt: new Date(now.getTime() - 105 * 60 * 1000), // Completed 105 mins ago
      },
    }),
  ])

  console.log('✅ Seed completed successfully!')
  console.log(`
📊 Created:
   - ${categories.length} Categories
   - ${services.length} Services
   - ${staff.length} Staff Members
   - 32 Customers total (23 with historical visits + 9 current walk-ins)
   - ${allHistoricalVisits.length} Historical visits
   - ${walkIns.length} Current Walk-In Customers
   
💡 Customer Visit Patterns:
   - Monthly Regulars (7 customers): 7-12 visits each over 7-12 months
   - Bi-Monthly Regulars (5 customers): 4-6 visits each over 8-12 months
   - Quarterly Visitors (3 customers): 3-4 visits each over 9-12 months
   - Rare Visitors (8 customers): 1-2 visits in past year
   
💡 Demo ready! Your queue has:
   - 2 customers currently being served
   - 4 customers waiting
   - 3 completed appointments for analytics
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

