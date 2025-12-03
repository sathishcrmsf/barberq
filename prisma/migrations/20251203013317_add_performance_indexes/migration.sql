-- CreateIndex
CREATE INDEX "WalkIn_status_idx" ON "WalkIn"("status");

-- CreateIndex
CREATE INDEX "WalkIn_createdAt_idx" ON "WalkIn"("createdAt");

-- CreateIndex
CREATE INDEX "WalkIn_customerId_idx" ON "WalkIn"("customerId");

-- CreateIndex
CREATE INDEX "WalkIn_staffId_idx" ON "WalkIn"("staffId");

-- CreateIndex
CREATE INDEX "WalkIn_status_createdAt_idx" ON "WalkIn"("status", "createdAt");
