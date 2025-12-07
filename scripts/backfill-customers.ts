// Script to backfill customer records for existing walk-ins
// Run this after deployment to link existing walk-ins to customers

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillCustomers() {
  console.log('🔄 Starting customer backfill...');

  // Find all walk-ins without a customer
  const walkInsWithoutCustomer = await prisma.walkIn.findMany({
    where: {
      customerId: null,
      customerName: { not: null }
    }
  });

  console.log(`Found ${walkInsWithoutCustomer.length} walk-ins without customers`);

  let created = 0;
  let linked = 0;

  for (const walkIn of walkInsWithoutCustomer) {
    if (!walkIn.customerName) continue;

    // Generate a placeholder phone number
    const placeholderPhone = `+91000000${String(created + 1).padStart(4, '0')}`;

    try {
      // Create or find customer
      const customer = await prisma.customer.upsert({
        where: { phone: placeholderPhone },
        update: {},
        create: {
          phone: placeholderPhone,
          name: walkIn.customerName,
          updatedAt: new Date(),
        }
      });

      // Link walk-in to customer
      await prisma.walkIn.update({
        where: { id: walkIn.id },
        data: { customerId: customer.id }
      });

      linked++;
      if (created === 0 || !await prisma.customer.findUnique({ where: { phone: placeholderPhone } })) {
        created++;
      }
    } catch (error) {
      console.error(`Error processing walk-in ${walkIn.id}:`, error);
    }
  }

  console.log(`✅ Created ${created} customers`);
  console.log(`✅ Linked ${linked} walk-ins to customers`);
  console.log('🎉 Backfill complete!');
}

backfillCustomers()
  .catch((error) => {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

