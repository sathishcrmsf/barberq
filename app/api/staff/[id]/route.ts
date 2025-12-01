// @cursor: This API route handles individual Staff operations.
// Supports GET, PATCH (update), and DELETE for specific staff members.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for staff update
const updateStaffSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  title: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  imageUrl: z.string().optional(),
  bio: z.string().max(300).optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/staff/[id] - Get a specific staff member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        staffServices: {
          include: {
            service: true
          },
          orderBy: {
            isPrimary: 'desc'
          }
        },
        walkIns: {
          where: {
            status: {
              in: ['waiting', 'in-progress']
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        _count: {
          select: { 
            staffServices: true,
            walkIns: true 
          }
        }
      }
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(staff, { status: 200 });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

// PATCH /api/staff/[id] - Update a staff member
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateStaffSchema.parse(body);

    // Check if staff exists
    const existing = await prisma.staff.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    const staff = await prisma.staff.update({
      where: { id },
      data: validatedData,
      include: {
        staffServices: {
          include: {
            service: true
          },
          orderBy: {
            isPrimary: 'desc'
          }
        },
        _count: {
          select: { 
            staffServices: true,
            walkIns: true 
          }
        }
      }
    });

    return NextResponse.json(staff, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating staff:', error);
    return NextResponse.json(
      { error: 'Failed to update staff' },
      { status: 500 }
    );
  }
}

// DELETE /api/staff/[id] - Delete a staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if staff exists
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        walkIns: {
          where: {
            status: {
              in: ['waiting', 'in-progress']
            }
          }
        }
      }
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Check if staff has active walk-ins
    if (staff.walkIns.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete staff member with active walk-ins',
          activeWalkIns: staff.walkIns.length 
        },
        { status: 403 }
      );
    }

    // Delete staff (StaffService entries will be cascade deleted)
    await prisma.staff.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Staff member deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff' },
      { status: 500 }
    );
  }
}

