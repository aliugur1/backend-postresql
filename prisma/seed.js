// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function main() {
  // 1. Admin kullanıcısını oluştur
  const passwordHash = await bcrypt.hash("Admin123!", 10);
  await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@mepsan-demo.com",
      phone: "05551000000",
      password: passwordHash,
      role: "ADMIN",
      stationName: "Mepsan Demo İstasyonu",
      stationCode: "MPS-001",
      stationAddress: "Aksaray Merkez",
      city: "Aksaray",
      district: "Merkez",
    },
  });

  // 2. 20 adet pompa oluştur
  await prisma.pump.createMany({
    data: Array.from({ length: 20 }).map((_, i) => ({
      name: `Pompa ${i + 1}`,
      pumpNumber: i + 1,
      serialNumber: `PMP-2026-${String(i + 1).padStart(4, "0")}`,
      fuelType: faker.helpers.arrayElement([
        "GASOLINE_95",
        "GASOLINE_97",
        "DIESEL",
        "PREMIUM_DIESEL",
      ]),
      unitPrice: faker.number.float({ min: 40, max: 55, fractionDigits: 2 }),
    })),
  });
}

main().finally(() => prisma.$disconnect());
