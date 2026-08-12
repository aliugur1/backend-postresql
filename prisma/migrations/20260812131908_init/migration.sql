-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('GASOLINE_95', 'GASOLINE_97', 'DIESEL', 'PREMIUM_DIESEL', 'LPG');

-- CreateEnum
CREATE TYPE "PumpStatus" AS ENUM ('ACTIVE', 'PASSIVE', 'FAULTY', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('INDIVIDUAL', 'CORPORATE');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'PASSIVE');

-- CreateEnum
CREATE TYPE "LoyaltyLevel" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CASH', 'CREDIT_CARD', 'ON_ACCOUNT', 'FLEET_CARD');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('SALE', 'PUMP_STATUS_CHANGED', 'CUSTOMER_CREATED', 'CUSTOMER_UPDATED', 'CUSTOMER_DELETED');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('User', 'Pump', 'Customer', 'Sale');

-- CreateEnum
CREATE TYPE "PumpModel" AS ENUM ('ProLine_4', 'SmartLine_X');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "stationName" TEXT,
    "stationCode" TEXT,
    "stationAddress" TEXT,
    "city" TEXT,
    "district" TEXT,
    "profileImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pump" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pumpNumber" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "stationCode" TEXT NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "status" "PumpStatus" NOT NULL DEFAULT 'ACTIVE',
    "brand" TEXT NOT NULL DEFAULT 'MEPSAN',
    "model" "PumpModel" NOT NULL,
    "nozzleCount" INTEGER NOT NULL DEFAULT 4,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "dailyLiter" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "dailyRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "monthlyLiter" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "monthlyRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalLiter" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lastSaleAt" TIMESTAMP(3),
    "lastMaintenanceAt" TIMESTAMP(3),
    "nextMaintenanceAt" TIMESTAMP(3),
    "faultCode" TEXT,
    "faultMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pump_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "customerType" "CustomerType" NOT NULL DEFAULT 'INDIVIDUAL',
    "firstName" TEXT,
    "lastName" TEXT,
    "companyName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "plateNumber" TEXT,
    "taxNumber" TEXT,
    "taxOffice" TEXT,
    "city" TEXT,
    "district" TEXT,
    "address" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "loyaltyLevel" "LoyaltyLevel" NOT NULL DEFAULT 'BRONZE',
    "totalPurchase" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalLiter" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "purchaseCount" INTEGER NOT NULL,
    "lastPurchaseAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "pumpId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "liter" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paymentType" "PaymentType" NOT NULL,
    "plateNumber" TEXT,
    "attendantName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT,
    "severity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_firstName_lastName_idx" ON "User"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_updateAt_idx" ON "User"("updateAt");

-- CreateIndex
CREATE UNIQUE INDEX "Pump_pumpNumber_key" ON "Pump"("pumpNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Pump_serialNumber_key" ON "Pump"("serialNumber");

-- CreateIndex
CREATE INDEX "Pump_name_idx" ON "Pump"("name");

-- CreateIndex
CREATE INDEX "Pump_fuelType_idx" ON "Pump"("fuelType");

-- CreateIndex
CREATE INDEX "Pump_status_idx" ON "Pump"("status");

-- CreateIndex
CREATE INDEX "Pump_dailyLiter_idx" ON "Pump"("dailyLiter");

-- CreateIndex
CREATE INDEX "Pump_dailyRevenue_idx" ON "Pump"("dailyRevenue");

-- CreateIndex
CREATE INDEX "Pump_monthlyLiter_idx" ON "Pump"("monthlyLiter");

-- CreateIndex
CREATE INDEX "Pump_monthlyRevenue_idx" ON "Pump"("monthlyRevenue");

-- CreateIndex
CREATE INDEX "Pump_totalLiter_idx" ON "Pump"("totalLiter");

-- CreateIndex
CREATE INDEX "Pump_totalRevenue_idx" ON "Pump"("totalRevenue");

-- CreateIndex
CREATE INDEX "Pump_lastSaleAt_idx" ON "Pump"("lastSaleAt");

-- CreateIndex
CREATE INDEX "Pump_createdAt_idx" ON "Pump"("createdAt");

-- CreateIndex
CREATE INDEX "Pump_updateAt_idx" ON "Pump"("updateAt");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "Customer_firstName_lastName_idx" ON "Customer"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "Customer_status_idx" ON "Customer"("status");

-- CreateIndex
CREATE INDEX "Customer_loyaltyLevel_idx" ON "Customer"("loyaltyLevel");

-- CreateIndex
CREATE INDEX "Customer_totalPurchase_idx" ON "Customer"("totalPurchase");

-- CreateIndex
CREATE INDEX "Customer_totalLiter_idx" ON "Customer"("totalLiter");

-- CreateIndex
CREATE INDEX "Customer_lastPurchaseAt_idx" ON "Customer"("lastPurchaseAt");

-- CreateIndex
CREATE INDEX "Customer_createdAt_idx" ON "Customer"("createdAt");

-- CreateIndex
CREATE INDEX "Customer_updateAt_idx" ON "Customer"("updateAt");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_receiptNumber_key" ON "Sale"("receiptNumber");

-- CreateIndex
CREATE INDEX "Sale_pumpId_createdAt_idx" ON "Sale"("pumpId", "createdAt");

-- CreateIndex
CREATE INDEX "Sale_customerId_createdAt_idx" ON "Sale"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "Sale_fuelType_idx" ON "Sale"("fuelType");

-- CreateIndex
CREATE INDEX "Sale_liter_idx" ON "Sale"("liter");

-- CreateIndex
CREATE INDEX "Sale_totalAmount_idx" ON "Sale"("totalAmount");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_pumpId_fkey" FOREIGN KEY ("pumpId") REFERENCES "Pump"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
