// Migration script to fix status values from 'completed' to 'done'
// This fixes the bug where completed items were incorrectly counted

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Starting status migration...');

  // Find all walk-ins with incorrect status
  const incorrectStatusRecords = await prisma.walkIn.findMany({
    where: {
      status: 'completed',
    },
  });

  console.log(`Found ${incorrectStatusRecords.length} records with status 'completed'`);

  if (incorrectStatusRecords.length === 0) {
    console.log('✅ No records to fix. Migration complete.');
    return;
  }

  // Update each record to 'done' status and set completedAt if missing
  for (const record of incorrectStatusRecords) {
    const updateData: {
      status: string;
      completedAt?: Date;
    } = {
      status: 'done',
    };

    // If completedAt is missing, set it to now (or startedAt + duration if available)
    if (!record.completedAt) {
      if (record.startedAt) {
        // Estimate completion time based on startedAt
        updateData.completedAt = new Date(record.startedAt);
        updateData.completedAt.setMinutes(updateData.completedAt.getMinutes() + 30); // Default 30 min service
      } else {
        updateData.completedAt = record.createdAt;
      }
    }

    await prisma.walkIn.update({
      where: { id: record.id },
      data: updateData,
    });

    console.log(`✅ Updated record ${record.id} (${record.customerName})`);
  }

  console.log(`\n✅ Migration complete! Fixed ${incorrectStatusRecords.length} records.`);
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

