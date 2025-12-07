// @cursor: This API route handles Staff CRUD operations.
// Returns all staff members (GET) and creates new staff (POST).
// Staff members can be assigned to services for skill-based matching.

import { NextRequest, NextResponse } from 'next/server';
import { prisma, executeWithRetry } from '@/lib/prisma';
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
    const staff = await executeWithRetry(async () => {
      return await prisma.staff.findMany({
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'desc' }
        ],
        include: {
          StaffService: {
            include: {
              Service: true
            },
            orderBy: {
              isPrimary: 'desc'
            }
          },
          _count: {
            select: { 
              StaffService: true,
              WalkIn: true 
            }
          }
        }
      });
    });

    return NextResponse.json(staff, { status: 200 });
  } catch (error) {
    console.error('Error fetching staff:', error);
    
    // Handle Prisma-specific errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Full error details:', { errorMessage, errorStack });
    
    const isConnectionError = 
      errorMessage.includes("Can't reach database") ||
      errorMessage.includes("P1001") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("DATABASE_URL") ||
      errorMessage.includes("Unknown field");

    if (isConnectionError) {
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: 'Unable to connect to the database. Please check your DATABASE_URL and ensure the database server is running.',
          message: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch staff',
        details: process.env.NODE_ENV === 'development' ? errorMessage : 'An error occurred while fetching staff',
        message: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// POST /api/staff - Create a new staff member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = staffSchema.parse(body);

    // Generate a unique ID for the staff member
    const generateId = () => {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 11);
      return `${timestamp}${random}`;
    };

    const staff = await executeWithRetry(async () => {
      return await prisma.staff.create({
        data: {
          id: generateId(),
          ...validatedData,
          updatedAt: new Date(),
        },
        include: {
          StaffService: {
            include: {
              Service: true
            }
          },
          _count: {
            select: { 
              StaffService: true,
              WalkIn: true 
            }
          }
        }
      });
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
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Full error details:', { errorMessage, errorStack });
    
    // Check for Prisma-specific errors
    const isConnectionError = 
      errorMessage.includes("Can't reach database") ||
      errorMessage.includes("P1001") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("DATABASE_URL") ||
      errorMessage.includes("Unknown field");

    if (isConnectionError) {
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: 'Unable to connect to the database. Please check your DATABASE_URL and ensure the database server is running.',
          message: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to create staff',
        details: process.env.NODE_ENV === 'development' ? errorMessage : 'An error occurred while creating staff',
        message: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

