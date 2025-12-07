// @cursor: This screen should strictly follow the BRD:
// Queue page → shows walk-ins, controls for start/done/delete.
// Add page → simple form. Do not add extra features.
// @cursor v1.5: Optimized for server-side rendering with caching
// Data is fetched server-side and passed to client component for instant loading

import { prisma, executeWithRetry } from "@/lib/prisma";
import { QueueClient } from "./queue-client";

// Revalidate every 3 seconds for fresh data
export const revalidate = 3;

export default async function QueuePage() {
  // Fetch walk-ins server-side with caching
  // Use executeWithRetry to handle connection pool issues
  // Optimized: Use select instead of include to fetch only needed fields
  const walkIns = await executeWithRetry(() =>
    prisma.walkIn.findMany({
      select: {
        id: true,
        customerId: true,
        customerName: true,
        service: true,
        barberName: true,
        status: true,
        notes: true,
        createdAt: true,
        startedAt: true,
        completedAt: true,
        Customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        Staff: {
          select: {
            id: true,
            name: true,
            title: true,
          }
        }
      },
      orderBy: {
        createdAt: "asc",
      },
    })
  );

  // Serialize dates for client component
  const serializedWalkIns = walkIns.map((walkIn) => ({
    ...walkIn,
    status: walkIn.status as "waiting" | "in-progress" | "done",
    createdAt: walkIn.createdAt.toISOString(),
    startedAt: walkIn.startedAt?.toISOString() || null,
    completedAt: walkIn.completedAt?.toISOString() || null,
  }));

  return <QueueClient initialWalkIns={serializedWalkIns} />;
}


