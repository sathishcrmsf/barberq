-- CreateTable
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "unit" TEXT NOT NULL DEFAULT 'unit',
    "imageUrl" TEXT,
    "thumbnailUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ProductSale" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "walkInId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "ProductSale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_isActive_idx" ON "Product"("isActive");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_stockQuantity_idx" ON "Product"("stockQuantity");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ProductSale_productId_idx" ON "ProductSale"("productId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ProductSale_walkInId_idx" ON "ProductSale"("walkInId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ProductSale_soldAt_idx" ON "ProductSale"("soldAt");

-- AddForeignKey (with existence check)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ProductSale_productId_fkey'
    ) THEN
        ALTER TABLE "ProductSale" 
        ADD CONSTRAINT "ProductSale_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "Product"("id") 
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey (with existence check)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ProductSale_walkInId_fkey'
    ) THEN
        ALTER TABLE "ProductSale" 
        ADD CONSTRAINT "ProductSale_walkInId_fkey" 
        FOREIGN KEY ("walkInId") REFERENCES "WalkIn"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
