-- AlterEnum: extend ActivityType with values used across the app / seed data
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'SALE_COMPLETED';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'CUSTOMER_STATUS_CHANGED';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'USER_REGISTERED';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'USER_PROFILE_UPDATED';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'PASSWORD_CHANGED';

-- AlterTable: Sale.customerId becomes optional (walk-in / cash sales have no linked customer)
ALTER TABLE "Sale" ALTER COLUMN "customerId" DROP NOT NULL;
