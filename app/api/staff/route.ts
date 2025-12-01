// @cursor: This API route handles Staff CRUD operations.
// Returns all staff members (GET) and creates new staff (POST).
// Staff members can be assigned to services for skill-based matching.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for staff creation
const staffSchema = z.object({
  name: z.string().min(1).max(100),
  title: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  imageUrl: z.string().optional(),
  bio: z.string().max(300).optional(),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// GET /api/staff - Get all staff members
export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ],
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
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

// POST /api/staff - Create a new staff member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = staffSchema.parse(body);

    const staff = await prisma.staff.create({
      data: validatedData,
      include: {
        staffServices: {
          include: {
            service: true
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

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating staff:', error);
    return NextResponse.json(
      { error: 'Failed to create staff' },
      { status: 500 }
    );
  }
}

