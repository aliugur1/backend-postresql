const prisma = require("../config/db");
const ApiError = require("../utils/ApiError");

const ALLOWED_SORT_FIELDS = [
  "pumpNumber",
  "name",
  "status",
  "unitPrice",
  "dailyLiter",
  "dailyRevenue",
  "createdAt",
];

// 1. Pompaları Listeleme Servisi (Tüm kolonları otomatik getirir)
async function getPumpsList() {
  const pump = await prisma.pump.findMany({
    orderBy: { createdAt: "desc" },
  });
  if (!pump) return null;
  // Gelen verilerin null/undefined olmasına karşı güvenli map
  return pump.map((pump) => ({
    ...pump,
    dailyLiter: pump.dailyLiter ?? 0,
    dailyRevenue: pump.dailyRevenue ?? 0,
    monthlyLiter: pump.monthlyLiter ?? 0,
    monthlyRevenue: pump.monthlyRevenue ?? 0,
    totalLiter: pump.totalLiter ?? 0,
    totalRevenue: pump.totalRevenue ?? 0,
    unitPrice: pump.unitPrice ?? 0,
    nozzleCount: pump.nozzleCount ?? 0,
  }));
}
// 2. Tek Pompa Servisi (id ile tek kayıt getirir, bulunamazsa null)
async function getPump(pumpId) {
  const pump = await prisma.pump.findUnique({
    where: { id: pumpId },
  });
  if (!pump) return null;
  // Gelen verilerin null/undefined olmasına karşı güvenli map
  return {
    ...pump,
    dailyLiter: pump.dailyLiter ?? 0,
    dailyRevenue: pump.dailyRevenue ?? 0,
    monthlyLiter: pump.monthlyLiter ?? 0,
    monthlyRevenue: pump.monthlyRevenue ?? 0,
    totalLiter: pump.totalLiter ?? 0,
    totalRevenue: pump.totalRevenue ?? 0,
    unitPrice: pump.unitPrice ?? 0,
    nozzleCount: pump.nozzleCount ?? 0,
  };
}
// Bugün / son 7 gün / son 30 gün için satış toplamlarını hesaplar
async function getStatisticsData(pumpId) {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const last7DaysStart = new Date(todayStart);
  last7DaysStart.setDate(todayStart.getDate() - 7);
  const last30DaysStart = new Date(todayStart);
  last30DaysStart.setDate(todayStart.getDate() - 30);

  const [pump, todaySales, last7DaysSales, last30DaysSales] = await Promise.all(
    [
      prisma.pump.findUnique({
        // DOĞRUSU: id kolonu üzerinden dışarıdan gelen pumpId'yi aratıyoruz
        where: { id: pumpId },
      }),
      prisma.sale.aggregate({
        _sum: { liter: true, totalAmount: true },
        _count: true,
        where: { pumpId, createdAt: { gte: todayStart } },
      }),
      prisma.sale.aggregate({
        _count: true,
        _sum: { liter: true, totalAmount: true },
        where: { pumpId, createdAt: { gte: last7DaysStart } },
      }),
      prisma.sale.aggregate({
        _count: true,
        _sum: { liter: true, totalAmount: true },
        where: { pumpId, createdAt: { gte: last30DaysStart } },
      }),
    ],
  );
  if (!pump) return null;
  return {
    pumpId,
    today: {
      salesCount: todaySales._count || 0,
      totalLiter: todaySales._sum.liter || 0,
      totalRevenue: todaySales._sum.totalAmount || 0,
    },
    last7Days: {
      salesCount: last7DaysSales._count || 0,
      totalLiter: last7DaysSales._sum.liter || 0,
      totalRevenue: last7DaysSales._sum.totalAmount || 0,
    },
    last30Days: {
      salesCount: last30DaysSales._count || 0,
      totalLiter: last30DaysSales._sum.liter || 0,
      totalRevenue: last30DaysSales._sum.totalAmount || 0,
    },
  };
}
// Fonksiyona dışarıdan hangi pompayı istediğimizi parametre olarak geçiyoruz
async function getFuelSummaryData(pumpId) {
  // 1. Paralel sorgu: Hem pompanın künyesini alıyoruz hem de o pompanın toplam satışlarını topluyoruz
  const [pump, saleSummary] = await Promise.all([
    // Pompanın adı ve yakıt türünü öğrenmek için
    prisma.pump.findUnique({
      // DOĞRUSU: id kolonu üzerinden dışarıdan gelen pumpId'yi aratıyoruz
      where: { id: pumpId },
    }),
    // Bu pompanın sale tablosundaki toplam ciro ve litresini hesaplamak için
    prisma.sale.aggregate({
      _count: true,
      _sum: { liter: true, totalAmount: true },
      where: { pumpId }, // Satış tablosundaki kolon adı pumpId olduğu için burası doğru
    }),
  ]);
  // Eğer veri tabanında böyle bir pompa hiç yoksa null dönüyoruz
  if (!pump) return null;
  // 2. Verileri birleştirip tek bir nesne olarak dönüyoruz
  return {
    fuelType: pump.fuelType,
    totalLiter: saleSummary._sum.liter ?? 0,
    revenue: saleSummary._sum.totalAmount ?? 0,
    salesCount: saleSummary._count ?? 0,
  };
}
// Pompanın güncel arıza durumu ve bakım tarihlerini döner
async function getMaintenanceData(pumpId) {
  const pump = await prisma.pump.findUnique({
    where: { id: pumpId },
  });
  if (!pump) return null;

  const {
    faultCode = 0,
    faultMessage = "Hata Yok",
    lastMaintenanceAt = 0,
    nextMaintenanceAt = 0,
  } = pump;

  return { faultCode, faultMessage, lastMaintenanceAt, nextMaintenanceAt };
}
// Pompanın son 10 satışını (en yeniden eskiye) döner
async function getSalesData(pumpId) {
  const pump = await prisma.pump.findUnique({
    where: { id: pumpId },
    include: {
      sales: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!pump) return null;
  if (!pump.sales.length) return [];

  return pump.sales.map((s) => ({
    ...s,
    liter: s.liter ?? 0,
    unitPrice: s.unitPrice ?? 0,
    totalAmount: s.totalAmount ?? 0,
  }));
}
// Pompayı FAULTY yapar ve aynı transaction içinde bir activity/log kaydı oluşturur
async function reportFault(pumpId, { faultCode, faultMessage }) {
  const [updatedPump] = await prisma.$transaction([
    prisma.pump.update({
      where: { id: pumpId },
      data: { faultCode, faultMessage, status: "FAULTY" },
    }),
    prisma.activity.create({
      data: {
        type: "PUMP_STATUS_CHANGED",
        title: `Pompa arızalandı (ID: ${pumpId})`,
        description: faultMessage,
        entityType: "Pump",
        entityId: pumpId,
        severity: "HIGH",
      },
    }),
  ]);
  return updatedPump;
}
// Bakımı tamamlar: arıza alanlarını temizler, pompayı ACTIVE yapar ve activity/log kaydı oluşturur
async function reportMaintenance(pumpId, { nextMaintenanceAt } = {}) {
  const [updatedPump] = await prisma.$transaction([
    prisma.pump.update({
      where: { id: pumpId },
      data: {
        lastMaintenanceAt: new Date(),
        nextMaintenanceAt: nextMaintenanceAt ?? null,
        faultCode: null,
        faultMessage: null,
        status: "ACTIVE",
      },
    }),
    prisma.activity.create({
      data: {
        type: "PUMP_STATUS_CHANGED",
        title: `Pompa bakımı tamamlandı`,
        description: "Pompa bakımdan geçti ve tekrar aktif edildi.",
        entityType: "Pump",
        entityId: pumpId,
        severity: "LOW",
      },
    }),
  ]);
  return updatedPump;
}

// Arama/filtre/sıralama/sayfalama destekli pompa listesi
async function searchPumps({
  page = 1,
  limit = 20,
  search,
  status,
  fuelType,
  stationCode,
  minDailyRevenue,
  maxDailyRevenue,
  sortBy = "createdAt",
  sortOrder = "desc",
}) {
  if (!ALLOWED_SORT_FIELDS.includes(sortBy)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Geçersiz sortBy değeri.");
  }

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { serialNumber: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
    ...(fuelType ? { fuelType } : {}),
    ...(stationCode ? { stationCode } : {}),
    ...(minDailyRevenue || maxDailyRevenue
      ? {
          dailyRevenue: {
            ...(minDailyRevenue ? { gte: Number(minDailyRevenue) } : {}),
            ...(maxDailyRevenue ? { lte: Number(maxDailyRevenue) } : {}),
          },
        }
      : {}),
  };

  const numericPage = Number(page);
  const numericLimit = Number(limit);
  const skip = (numericPage - 1) * numericLimit;

  const [items, totalItems] = await Promise.all([
    prisma.pump.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: numericLimit,
    }),
    prisma.pump.count({ where }),
  ]);

  return { items, totalItems };
}

// PASSIVE/MAINTENANCE gibi ek alan gerektirmeyen durum geçişleri için
// (FAULTY/ACTIVE geçişleri reportFault/reportMaintenance üzerinden yürür)
async function setPumpStatus(pumpId, status) {
  const [updatedPump] = await prisma.$transaction([
    prisma.pump.update({
      where: { id: pumpId },
      data: { status },
    }),
    prisma.activity.create({
      data: {
        type: "PUMP_STATUS_CHANGED",
        title: `Pompa durumu değişti: ${status}`,
        description: `Pompa durumu ${status} olarak güncellendi.`,
        entityType: "Pump",
        entityId: pumpId,
        severity: "LOW",
      },
    }),
  ]);
  return updatedPump;
}

module.exports = {
  getPumpsList,
  getPump,
  getStatisticsData,
  getFuelSummaryData,
  getMaintenanceData,
  getSalesData,
  reportFault,
  reportMaintenance,
  searchPumps,
  setPumpStatus,
};
