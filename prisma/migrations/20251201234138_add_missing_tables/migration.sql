-- CreateTable
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "imageUrl" TEXT,
    "bio" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "StaffService" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "yearsExperience" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "StaffService_staffId_serviceId_key" ON "StaffService"("staffId", "serviceId");

-- AlterTable: Add columns to Service table
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "thumbnailUrl" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "imageAlt" TEXT;

-- AlterTable: Add columns to WalkIn table
ALTER TABLE "WalkIn" ADD COLUMN IF NOT EXISTS "staffId" TEXT;

-- AlterTable: Make customerId nullable (if it exists and is not nullable)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'WalkIn' AND column_name = 'customerId' 
               AND is_nullable = 'NO') THEN
        ALTER TABLE "WalkIn" ALTER COLUMN "customerId" DROP NOT NULL;
    END IF;
END $$;

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Service_categoryId_fkey'
    ) THEN
        ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" 
        FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'WalkIn_staffId_fkey'
    ) THEN
        ALTER TABLE "WalkIn" ADD CONSTRAINT "WalkIn_staffId_fkey" 
        FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'StaffService_staffId_fkey'
    ) THEN
        ALTER TABLE "StaffService" ADD CONSTRAINT "StaffService_staffId_fkey" 
        FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'StaffService_serviceId_fkey'
    ) THEN
        ALTER TABLE "StaffService" ADD CONSTRAINT "StaffService_serviceId_fkey" 
        FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
