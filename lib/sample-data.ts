// @cursor: Sample data generator for demo/trial purposes
// Creates realistic demo data to help new users understand the system

import { prisma } from "./prisma";

const sampleServices = [
  { name: "Haircut", price: 25, duration: 30 },
  { name: "Fade", price: 30, duration: 35 },
  { name: "Beard Trim", price: 15, duration: 20 },
  { name: "Haircut + Beard", price: 35, duration: 45 },
  { name: "Kids Cut", price: 20, duration: 25 },
];

const sampleCustomers = [
  { name: "Mike Johnson", phone: "+15551234567" },
  { name: "Sarah Williams", phone: "+15551234568" },
  { name: "David Chen", phone: "+15551234569" },
  { name: "Emily Rodriguez", phone: "+15551234570" },
  { name: "James Brown", phone: "+15551234571" },
];

const sampleStaff = [
  { name: "Alex Martinez", title: "Senior Barber" },
  { name: "Jordan Taylor", title: "Master Stylist" },
];

export async function generateSampleData() {
  try {
    // Create services
    const services = [];
    for (const service of sampleServices) {
      const created = await prisma.service.upsert({
        where: { name: service.name },
        update: {},
        create: service,
      });
      services.push(created);
    }

    // Create staff
    const staff = [];
    for (const staffMember of sampleStaff) {
      const existing = await prisma.staff.findFirst({
        where: { name: staffMember.name },
      });
      const created = existing || await prisma.staff.create({
        data: staffMember,
      });
      staff.push(created);
    }

    // Create customers
    const customers = [];
    for (const customer of sampleCustomers) {
      const created = await prisma.customer.upsert({
        where: { phone: customer.phone },
        update: {},
        create: customer,
      });
      customers.push(created);
    }

    // Create sample walk-ins (mix of statuses)
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Completed walk-ins from yesterday
    for (let i = 0; i < 3; i++) {
      const customer = customers[i % customers.length];
      const service = services[i % services.length];
      const staffMember = staff[i % staff.length];
      const createdAt = new Date(yesterday);
      createdAt.setHours(10 + i, 30, 0, 0);
      const startedAt = new Date(createdAt);
      startedAt.setMinutes(startedAt.getMinutes() + 5);
      const completedAt = new Date(startedAt);
      completedAt.setMinutes(completedAt.getMinutes() + service.duration);

      await prisma.walkIn.create({
        data: {
          customerId: customer.id,
          customerName: customer.name,
          service: service.name,
          staffId: staffMember.id,
          status: "done",
          createdAt,
          startedAt,
          completedAt,
        },
      });
    }

    // In-progress walk-in
    const inProgressCustomer = customers[3];
    const inProgressService = services[0];
    const inProgressStaff = staff[0];
    const inProgressCreated = new Date(now);
    inProgressCreated.setMinutes(inProgressCreated.getMinutes() - 15);
    const inProgressStarted = new Date(now);
    inProgressStarted.setMinutes(inProgressStarted.getMinutes() - 10);

    await prisma.walkIn.create({
      data: {
        customerId: inProgressCustomer.id,
        customerName: inProgressCustomer.name,
        service: inProgressService.name,
        staffId: inProgressStaff.id,
        status: "in-progress",
        createdAt: inProgressCreated,
        startedAt: inProgressStarted,
      },
    });

    // Waiting walk-ins
    for (let i = 0; i < 2; i++) {
      const customer = customers[(i + 4) % customers.length];
      const service = services[(i + 1) % services.length];
      const createdAt = new Date(now);
      createdAt.setMinutes(createdAt.getMinutes() - (10 - i * 5));

      await prisma.walkIn.create({
        data: {
          customerId: customer.id,
          customerName: customer.name,
          service: service.name,
          status: "waiting",
          createdAt,
        },
      });
    }

    return {
      success: true,
      message: "Sample data generated successfully",
      counts: {
        services: services.length,
        staff: staff.length,
        customers: customers.length,
        walkIns: 6,
      },
    };
  } catch (error) {
    console.error("Error generating sample data:", error);
    return {
      success: false,
      message: "Failed to generate sample data",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

