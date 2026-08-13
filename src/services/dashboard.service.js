const prisma = require("../config/db");

//Promise.all Içerisine yazılan veri tabanı sorgusunu aynı anda başlatır
async function getSummary() {
  const now = new Date();
  // Bugünün başlangıcı (Gece yarısı 00:00:00)
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  // Bu ayın başlangıcı (Ayın 1'i 00:00:00)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [pumpStats, customerStats, customerCount, todayAgg, monthAgg] =
    await Promise.all([
      prisma.pump.groupBy({ by: ["status"], _count: true }),
      prisma.customer.groupBy({ by: ["status"], _count: true }),
      prisma.customer.count(),
      prisma.sale.aggregate({
        _count: true,
        _sum: { liter: true, totalAmount: true },
        //(Bugünün Tarihi): new Date().setHours(0,0,0,0)
        where: { createdAt: { gte: todayStart } },
      }),
      prisma.sale.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: monthStart } },
      }),
    ]);
  // Gruplanmış Dizi Verisini Nesneye Çevirme (byStatus)
  const byStatus = Object.fromEntries(
    pumpStats.map((s) => [s.status, s._count]),
  );
  const byStatus2 = Object.fromEntries(
    customerStats.map((s) => [s.status, s._count]),
  );
  return {
    totalPumps: pumpStats.reduce((a, s) => a + s._count, 0),
    activePumps: byStatus.ACTIVE ?? 0,
    passivePumps: byStatus.PASSIVE ?? 0,
    faultyPumps: byStatus.FAULTY ?? 0,
    maintenancePumps: byStatus.MAINTENANCE ?? 0,
    totalCustomers: customerCount,
    activeCustomers: byStatus2.ACTIVE ?? 0,
    passiveCustomers: byStatus2.PASSIVE ?? 0,
    todaySalesCount: todayAgg._count,
    todayLiter: todayAgg._sum.liter ?? 0,
    todayRevenue: todayAgg._sum.totalAmount ?? 0,
    monthlyRevenue: monthAgg._sum.totalAmount ?? 0,
  };
}
async function getTopPumps(limit = 1) {
  const rows = await prisma.sale.groupBy({
    by: ["pumpId"],
    _sum: { liter: true, totalAmount: true },
    orderBy: { _sum: { totalAmount: "desc" } },
    take: limit,
  });
  //Pompaların Detay Bilgilerini Çekme
  const pumps = await prisma.pump.findMany({
    where: { id: { in: rows.map((r) => r.pumpId) } },
  });
  return rows
    .map((r) => {
      // İlgili pompayı buluyoruz
      const pump = pumps.find((p) => p.id === r.pumpId);
      if (!pump) return null;
      return {
        id: pump.id,
        name: pump.name,
        fuelType: pump.fuelType,
        totalLiter: r._sum.liter ?? 0,
        revenue: r._sum.totalAmount ?? 0,
      };
    })
    .filter(Boolean);
}
async function getSalesChart(period) {
  // Mongoose'da $dateToString ile gruplama vardı; Prisma groupBy tarih formatlamayı desteklemez,
  // bu tek durumda ham SQL (raw query) en pratik çözüm:
  const bucket =
    period === "today" ? "hour" : period === "12m" ? "month" : "day";
  const since =
    period === "today"
      ? new Date(new Date().setHours(0, 0, 0, 0))
      : period === "12m"
        ? new Date(new Date().setMonth(new Date().getMonth() - 12))
        : new Date(new Date().setDate(new Date().getDate() - 30));

  return prisma.$queryRaw`
    SELECT date_trunc(${bucket}, "createdAt") AS label,
        COUNT(*)::int AS "salesCount",
        SUM(liter) AS "totalLiter",
        SUM("totalAmount") AS revenue
    FROM "Sale"
    WHERE "createdAt" >= ${since}
    GROUP BY label
    ORDER BY label
  `;
}
async function getFuelDistribution() {
  const rows = await prisma.sale.groupBy({
    by: ["fuelType"],
    _sum: { liter: true, totalAmount: true },
  });
  //rows.reduce((birikenToplam, su AnkiSatir)
  const total = rows.reduce((a, r) => a + Number(r._sum.liter ?? 0), 0) || 1;
  return rows.map((r) => ({
    fuelType: r.fuelType,
    totalLiter: r._sum.liter,
    revenue: r._sum.totalAmount,
    percentage: Math.round((Number(r._sum.liter ?? 0) / total) * 100),
  }));
}
async function getPumpStatusDistribution() {
  // Pompaları durumlarına (ACTIVE/PASSIVE/FAULTY/MAINTENANCE) göre grupla
  const rows = await prisma.pump.groupBy({
    by: ["status"],
    _count: true,
  });

  return rows.map((r) => ({
    status: r.status,
    count: r._count ?? 0,
  }));
}
async function getRecentSales(limit = 10) {
  const sales = await prisma.sale.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  // Her kolonu tek tek yazmak yerine, tüm objeyi açıp (...sale)
  // sadece null olabilecek sayısal değerlere varsayılan '0' atıyoruz.
  return sales.map((sale) => ({
    ...sale,
    liter: sale.liter ?? 0,
    totalAmount: sale.totalAmount ?? 0,
    unitPrice: sale.unitPrice ?? 0,
  }));
}

async function getRecentActivities(limit = 10) {
  // Son aktiviteler (satış, pompa durum değişikliği, müşteri işlemleri vb.)
  return await prisma.activity.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

module.exports = {
  getSummary,
  getFuelDistribution,
  getTopPumps,
  getSalesChart,
  getPumpStatusDistribution,
  getRecentActivities,
  getRecentSales,
};
