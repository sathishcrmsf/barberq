-- AlterTable: Add email column to Customer table
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "email" TEXT;

