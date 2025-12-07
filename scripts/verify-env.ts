#!/usr/bin/env tsx
/**
 * Verify that DATABASE_URL environment variable is properly loaded
 * Run with: npx tsx scripts/verify-env.ts
 */

// Load dotenv explicitly for this script
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL;

console.log("\n🔍 Environment Variable Verification\n");

if (!dbUrl) {
  console.error("❌ DATABASE_URL is NOT set!");
  console.error("\n💡 Solutions:");
  console.error("   1. Check that .env file exists in project root");
  console.error("   2. Verify DATABASE_URL is set in .env file");
  console.error("   3. Restart your dev server: npm run dev");
  process.exit(1);
}

console.log("✅ DATABASE_URL is set!");
console.log(`   Length: ${dbUrl.length} characters`);
console.log(`   Format: ${dbUrl.substring(0, 20)}...`);

// Check format
const isValidFormat =
  dbUrl.startsWith("postgresql://") ||
  dbUrl.startsWith("postgres://") ||
  dbUrl.startsWith("file:") ||
  dbUrl.startsWith("sqlite:");

if (!isValidFormat) {
  console.warn("\n⚠️  DATABASE_URL format might be incorrect");
  console.warn("   Expected: postgresql://, postgres://, file:, or sqlite://");
} else {
  console.log("✅ DATABASE_URL format looks correct");
}

// Check for common issues
if (dbUrl.includes(" ")) {
  console.warn("\n⚠️  DATABASE_URL contains spaces - this might cause issues");
}

if (dbUrl.includes("\n") || dbUrl.includes("\r")) {
  console.warn("\n⚠️  DATABASE_URL contains newlines - this will cause issues");
}

console.log("\n✅ Environment setup looks good!\n");

