// @cursor: This API route handles Staff-Service assignments.
// Manages which services a staff member can perform.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for service assignment
const assignServicesSchema = z.object({
  serviceIds: z.array(z.string()),
  primaryServiceId: z.string().optional(),
});

// POST /api/staff/[id]/services - Assign services to staff member
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { serviceIds, primaryServiceId } = assignServicesSchema.parse(body);

    // Check if staff exists
    const staff = await prisma.staff.findUnique({
      where: { id }
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Remove all existing service assignments for this staff member
    await prisma.staffService.deleteMany({
      where: { staffId: id }
    });

    // Create new service assignments
    const assignments = await Promise.all(
      serviceIds.map(serviceId =>
        prisma.staffService.create({
          data: {
            id: crypto.randomUUID(),
            staffId: id,
            serviceId,
            isPrimary: serviceId === primaryServiceId,
          },
          include: {
            Service: true
          }
        })
      )
    );

    return NextResponse.json(assignments, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error assigning services:', error);
    return NextResponse.json(
      { error: 'Failed to assign services' },
      { status: 500 }
    );
  }
}

// GET /api/staff/[id]/services - Get services for staff member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const staffServices = await prisma.staffService.findMany({
      where: { staffId: id },
      include: {
        Service: true
      },
      orderBy: [
        { isPrimary: 'desc' },
        { Service: { name: 'asc' } }
      ]
    });

    return NextResponse.json(staffServices, { status: 200 });
  } catch (error) {
    console.error('Error fetching staff services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff services' },
      { status: 500 }
    );
  }
}

