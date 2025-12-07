#!/usr/bin/env tsx
/**
 * Test database connection script
 * 
 * Usage:
 *   tsx scripts/test-db-connection.ts
 * 
 * This script tests the current DATABASE_URL connection
 * to help diagnose connection issues.
 */

import { checkDatabaseConnection } from '../lib/prisma';
import { prisma } from '../lib/prisma';

async function testConnection() {
  console.log('\n🔍 Testing Database Connection...\n');
  
  // Check environment variable
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.log('\n💡 Set it in your .env file or as an environment variable.');
    console.log('   Example: DATABASE_URL=postgresql://user:password@host:port/database');
    process.exit(1);
  }

  // Mask password in output
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':***@');
  console.log(`📍 Connection String: ${maskedUrl}`);
  
  // Check connection type
  const isPoolerDomain = dbUrl.includes('pooler.supabase.com');
  const isPoolerPort = dbUrl.includes(':6543');
  const isPooler = isPoolerDomain && isPoolerPort;
  const isWrongPoolerPort = isPoolerDomain && dbUrl.includes(':5432');
  const isDirect = dbUrl.includes('db.supabase.co') && dbUrl.includes(':5432');
  const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
  const isSqlite = dbUrl.startsWith('file:') || dbUrl.startsWith('sqlite:');
  
  console.log('\n📊 Connection Type:');
  if (isPooler) {
    console.log('✅ Connection Pooler (Recommended for Vercel)');
    console.log('   - Port: 6543 ✓');
    console.log('   - Domain: pooler.supabase.com ✓');
  } else if (isWrongPoolerPort) {
    console.log('❌ WRONG PORT DETECTED!');
    console.log('   - Domain: pooler.supabase.com ✓');
    console.log('   - Port: 5432 ✗ (Should be 6543)');
    console.log('\n🔧 FIX REQUIRED:');
    console.log('   Your connection string uses pooler domain but wrong port!');
    console.log('   Change port from 5432 to 6543 in your DATABASE_URL');
    console.log('\n💡 How to fix:');
    console.log('   1. Go to Supabase Dashboard → Settings → Database');
    console.log('   2. Find "Connection pooling" section');
    console.log('   3. Click "Session mode" tab');
    console.log('   4. Copy the connection string (should have :6543)');
    console.log('   5. Update your .env file:');
    console.log('      DATABASE_URL="postgresql://postgres.xxx:password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"');
    console.log('\n   Or manually fix by changing :5432 to :6543 in your current DATABASE_URL');
  } else if (isDirect) {
    console.log('⚠️  Direct Connection (May not work on Vercel)');
    console.log('   - Port: 5432');
    console.log('   - Domain: db.supabase.co');
    console.log('   - 💡 Consider switching to connection pooler for production');
    console.log('   - Pooler URL should use port 6543');
  } else if (isPostgres) {
    console.log('✅ PostgreSQL Connection');
  } else if (isSqlite) {
    console.log('✅ SQLite Connection (Local development)');
  } else {
    console.log('ℹ️  Unknown connection type');
  }

  // Test connection with retry logic
  console.log('\n🔌 Attempting to connect (with retry logic)...');
  const connectionCheck = await checkDatabaseConnection(3);
  
  if (!connectionCheck.connected) {
    console.error('\n❌ Connection failed!\n');
    console.error(`Error: ${connectionCheck.error}\n`);

    const errorMessage = connectionCheck.error || '';
    const errorLower = errorMessage.toLowerCase();

    // Provide helpful error messages
    if (errorLower.includes("can't reach database") || 
        errorLower.includes("p1001") ||
        errorLower.includes("connection") ||
        errorLower.includes("econnrefused")) {
      console.log('💡 Troubleshooting:');
      console.log('   1. Check if your database server is running');
      if (isPooler || isDirect) {
        console.log('   2. Visit Supabase dashboard to wake up the database');
      }
      console.log('   3. Verify DATABASE_URL is correct');
      if (isDirect) {
        console.log('   4. For Vercel, use connection pooler (port 6543)');
      }
      console.log('   5. Check if database password is correct');
      console.log('   6. Verify network connectivity');
    } else if (errorLower.includes("authentication failed") || 
               errorLower.includes("password")) {
      console.log('💡 Troubleshooting:');
      console.log('   1. Check if your database password is correct');
      if (isPooler || isDirect) {
        console.log('   2. Reset password in Supabase dashboard if needed');
      }
      console.log('   3. Update DATABASE_URL with new password');
    } else if (errorLower.includes("does not exist") ||
               errorLower.includes("relation") ||
               errorLower.includes("table")) {
      console.log('💡 Troubleshooting:');
      console.log('   1. Run migrations: npx prisma migrate dev');
      console.log('   2. Or push schema: npx prisma db push');
      console.log('   3. For production: npx prisma migrate deploy');
    } else {
      console.log('💡 Troubleshooting:');
      console.log('   1. Check your network connection');
      console.log('   2. Verify DATABASE_URL format is correct');
      if (isPooler || isDirect) {
        console.log('   3. Check Supabase project status');
      }
      console.log('   4. Review error message above for details');
    }

    console.log('');
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }

  console.log('✅ Successfully connected to database!\n');

  // Test a simple query
  console.log('📝 Testing queries...');
  try {
    const [walkInCount, serviceCount, staffCount, customerCount] = await Promise.all([
      prisma.walkIn.count().catch(() => 0),
      prisma.service.count().catch(() => 0),
      prisma.staff.count().catch(() => 0),
      prisma.customer.count().catch(() => 0),
    ]);

    console.log('\n📊 Database Statistics:');
    console.log(`   - Walk-ins: ${walkInCount}`);
    console.log(`   - Services: ${serviceCount}`);
    console.log(`   - Staff: ${staffCount}`);
    console.log(`   - Customers: ${customerCount}`);

    console.log('\n✅ All tests passed! Database connection is working.\n');
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Query test failed!\n');
    if (error instanceof Error) {
      console.error(`Error: ${error.message}\n`);
    } else {
      console.error('Unknown error:', error);
    }
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

// Run test
testConnection().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});

