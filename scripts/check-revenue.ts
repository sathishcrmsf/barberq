// Script to check current revenue
import { prisma } from '../lib/prisma';

async function checkRevenue() {
  try {
    // Get today's start time
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Get all completed walk-ins today
    const completedToday = await prisma.walkIn.findMany({
      where: {
        status: 'done',
        createdAt: { gte: todayStart },
      },
      select: {
        id: true,
        service: true,
        customerName: true,
        createdAt: true,
      },
    });

    // Get all services with prices
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    // Create service price map
    const servicePriceMap = new Map(services.map(s => [s.name, s.price]));
    const servicePriceMapLower = new Map(services.map(s => [s.name.toLowerCase().trim(), s.price]));

    // Calculate revenue
    let totalRevenue = 0;
    const revenueBreakdown: Array<{ service: string; price: number; count: number; total: number }> = [];

    completedToday.forEach(w => {
      const price = servicePriceMap.get(w.service) || 
                    servicePriceMapLower.get(w.service.toLowerCase().trim()) || 
                    0;
      totalRevenue += price;

      // Track breakdown
      const existing = revenueBreakdown.find(r => r.service === w.service);
      if (existing) {
        existing.count++;
        existing.total += price;
      } else {
        revenueBreakdown.push({
          service: w.service,
          price,
          count: 1,
          total: price,
        });
      }
    });

    console.log('\n📊 REVENUE REPORT');
    console.log('==================\n');
    console.log(`Total Revenue Today: ₹${totalRevenue.toFixed(2)}`);
    console.log(`Completed Walk-ins: ${completedToday.length}\n`);

    if (completedToday.length === 0) {
      console.log('⚠️  No completed walk-ins today.');
      console.log('   Revenue will be ₹0 until you mark some walk-ins as "done".\n');
    } else {
      console.log('Breakdown by Service:');
      console.log('-------------------');
      revenueBreakdown.forEach(item => {
        console.log(`  ${item.service}:`);
        console.log(`    Price: ₹${item.price.toFixed(2)}`);
        console.log(`    Count: ${item.count}`);
        console.log(`    Total: ₹${item.total.toFixed(2)}\n`);
      });
    }

    // Check for services without matches
    const unmatchedServices = completedToday
      .map(w => w.service)
      .filter(serviceName => {
        return !servicePriceMap.has(serviceName) && 
               !servicePriceMapLower.has(serviceName.toLowerCase().trim());
      });

    if (unmatchedServices.length > 0) {
      const uniqueUnmatched = [...new Set(unmatchedServices)];
      console.log('⚠️  WARNING: Some services in walk-ins don\'t match any service in the database:');
      uniqueUnmatched.forEach(service => {
        console.log(`    - "${service}"`);
      });
      console.log('\n   These walk-ins will contribute ₹0 to revenue.');
      console.log('   Please ensure service names match exactly.\n');
    }

    // Show all available services
    console.log('Available Services:');
    console.log('------------------');
    if (services.length === 0) {
      console.log('  ⚠️  No services found in database!');
    } else {
      services.forEach(s => {
        console.log(`  - ${s.name}: ₹${s.price.toFixed(2)}`);
      });
    }

    console.log('\n');

  } catch (error) {
    console.error('Error checking revenue:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkRevenue();

