// @cursor: API route to generate sample data for new users
// Helps users understand the system with realistic demo data

import { NextResponse } from "next/server";
import { generateSampleData } from "@/lib/sample-data";

export async function POST() {
  try {
    const result = await generateSampleData();
    
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error("Error generating sample data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate sample data" },
      { status: 500 }
    );
  }
}

