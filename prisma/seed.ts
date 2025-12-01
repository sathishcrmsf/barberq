// @cursor: Seed script to populate demo data for BarberQ MVP
// Creates realistic test data: Categories, Services, Staff, and WalkIns

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  console.log('🧹 Cleaning existing data...')
  await prisma.walkIn.deleteMany()
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

  // 5. Create Walk-Ins (Queue Data)
  console.log('🚶 Creating walk-in customers...')
  const now = new Date()
  const walkIns = await Promise.all([
    // Currently being served
    prisma.walkIn.create({
      data: {
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
        customerName: 'Robert Wilson',
        service: 'Beard & Haircut Combo',
        status: 'waiting',
        notes: 'No rush, wants full service',
        createdAt: new Date(now.getTime() - 3 * 60 * 1000), // 3 mins ago
      },
    }),
    prisma.walkIn.create({
      data: {
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
        customerName: 'Jason Taylor',
        service: 'Hot Towel Shave',
        staffId: staff[1].id,
        status: 'completed',
        notes: 'Very satisfied, tipped well',
        createdAt: new Date(now.getTime() - 90 * 60 * 1000), // 90 mins ago
        startedAt: new Date(now.getTime() - 85 * 60 * 1000),
      },
    }),
    prisma.walkIn.create({
      data: {
        customerName: 'Kevin White',
        service: 'Premium Fade',
        staffId: staff[0].id,
        status: 'completed',
        createdAt: new Date(now.getTime() - 120 * 60 * 1000), // 2 hours ago
        startedAt: new Date(now.getTime() - 115 * 60 * 1000),
      },
    }),
    prisma.walkIn.create({
      data: {
        customerName: 'Daniel Harris',
        service: 'Beard Trim',
        staffId: staff[0].id,
        status: 'completed',
        createdAt: new Date(now.getTime() - 135 * 60 * 1000),
        startedAt: new Date(now.getTime() - 130 * 60 * 1000),
      },
    }),
  ])

  console.log('✅ Seed completed successfully!')
  console.log(`
📊 Created:
   - ${categories.length} Categories
   - ${services.length} Services
   - ${staff.length} Staff Members
   - ${walkIns.length} Walk-In Customers
   
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

