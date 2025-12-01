-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- AlterTable: Add customerId column (nullable initially for migration)
ALTER TABLE "WalkIn" ADD COLUMN "customerId" TEXT;

-- AlterTable: Add completedAt column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'WalkIn' AND column_name = 'completedAt') THEN
        ALTER TABLE "WalkIn" ADD COLUMN "completedAt" TIMESTAMP(3);
    END IF;
END $$;

-- Create customer records for existing walk-ins with placeholder phone numbers
-- Using a sequence to generate unique placeholder phones
DO $$
DECLARE
    walkin_record RECORD;
    counter INTEGER := 1;
    placeholder_phone TEXT;
BEGIN
    FOR walkin_record IN SELECT id, "customerName" FROM "WalkIn" WHERE "customerId" IS NULL LOOP
        -- Generate placeholder phone: +910000000001, +910000000002, etc.
        placeholder_phone := '+91' || LPAD(counter::TEXT, 10, '0');
        
        -- Insert customer record
        INSERT INTO "Customer" (id, phone, name, "createdAt", "updatedAt")
        VALUES (
            gen_random_uuid()::TEXT,
            placeholder_phone,
            walkin_record."customerName",
            NOW(),
            NOW()
        )
        ON CONFLICT (phone) DO NOTHING;
        
        -- Link walk-in to customer
        UPDATE "WalkIn"
        SET "customerId" = (SELECT id FROM "Customer" WHERE phone = placeholder_phone LIMIT 1)
        WHERE id = walkin_record.id;
        
        counter := counter + 1;
    END LOOP;
END $$;

-- AddForeignKey
ALTER TABLE "WalkIn" ADD CONSTRAINT "WalkIn_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Make customerId required (NOT NULL)
ALTER TABLE "WalkIn" ALTER COLUMN "customerId" SET NOT NULL;

-- Make customerName optional (nullable) for backward compatibility
ALTER TABLE "WalkIn" ALTER COLUMN "customerName" DROP NOT NULL;

