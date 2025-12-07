// Script to add the combined service "H. massage + Hair Spa"
import { prisma } from '../lib/prisma';

async function addCombinedService() {
  try {
    // Check if service already exists
    const existing = await prisma.service.findFirst({
      where: {
        name: {
          equals: 'H. massage + Hair Spa',
          mode: 'insensitive'
        }
      }
    });

    if (existing) {
      console.log('✅ Service "H. massage + Hair Spa" already exists!');
      console.log(`   Price: ₹${existing.price.toFixed(2)}`);
      console.log(`   Duration: ${existing.duration} minutes`);
      return;
    }

    // Get individual service durations to estimate combined duration
    const massageService = await prisma.service.findFirst({
      where: { name: { equals: 'H. massage', mode: 'insensitive' } }
    });
    const hairSpaService = await prisma.service.findFirst({
      where: { name: { equals: 'Hair Spa', mode: 'insensitive' } }
    });

    // Estimate duration (sum of both services, or default to 90 minutes)
    const estimatedDuration = massageService && hairSpaService
      ? massageService.duration + hairSpaService.duration
      : 90; // Default 90 minutes if services not found

    // Create the combined service
    const service = await prisma.service.create({
      data: {
        id: crypto.randomUUID(),
        name: 'H. massage + Hair Spa',
        price: 350, // ₹100 + ₹250
        duration: estimatedDuration,
        description: 'Combined service: H. massage and Hair Spa',
        isActive: true,
        updatedAt: new Date(),
      },
    });

    console.log('✅ Successfully added service:');
    console.log(`   Name: ${service.name}`);
    console.log(`   Price: ₹${service.price.toFixed(2)}`);
    console.log(`   Duration: ${service.duration} minutes`);
    console.log('\n💰 Revenue should now calculate correctly!');

  } catch (error) {
    console.error('❌ Error adding service:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addCombinedService();

