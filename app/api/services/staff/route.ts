// @cursor: API route for managing service-staff assignments
// Handles bulk assignment of staff to services

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const assignStaffSchema = z.object({
  serviceId: z.string(),
  staffIds: z.array(z.string()),
});

// POST /api/services/staff - Assign staff to a service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = assignStaffSchema.parse(body);

    // First, remove all existing assignments for this service
    await prisma.staffService.deleteMany({
      where: { serviceId: validated.serviceId },
    });

    // Then create new assignments
    if (validated.staffIds.length > 0) {
      await prisma.staffService.createMany({
        data: validated.staffIds.map((staffId) => ({
          id: crypto.randomUUID(),
          serviceId: validated.serviceId,
          staffId,
          isPrimary: false,
        })),
      });
    }

    return NextResponse.json(
      { message: 'Staff assignments updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error assigning staff:', error);
    return NextResponse.json(
      { error: 'Failed to assign staff' },
      { status: 500 }
    );
  }
}

