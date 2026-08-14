const prisma = require("../config/db");
const ApiError = require("../utils/ApiError");

const ALLOWED_SORT_FIELDS = [
  "firstName",
  "lastName",
  "companyName",
  "totalLiter",
  "totalPurchase",
  "purchaseCount",
  "lastPurchaseAt",
  "createdAt",
];
async function getCustomersList() {
  const customer = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });
  return customer.map((c) => ({
    ...c,
    totalLiter: c.totalLiter ?? 0,
    totalPurchase: c.totalPurchase ?? 0,
  }));
}
async function getCustomer(customerId) {
  const c = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  if (!c) return null;
  return {
    ...c,
    totalLiter: c.totalLiter ?? 0,
    totalPurchase: c.totalPurchase ?? 0,
  };
}
async function getCustomerFuel(customerId) {
  // 1. Önce müşterinin varlığını kontrol edin (Performans için)
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  // Müşteri yoksa doğrudan null dönün, ikinci sorguyu hiç çalıştırmayın
  if (!customer) return null;
  // 2. Müşteri varsa satışları yakıt türüne göre gruplayın
  const fuelGroups = await prisma.sale.groupBy({
    by: ["fuelType"], // Yakıt türüne göre grupla
    where: { customerId },
    _count: {
      _all: true,
    },
    _sum: {
      liter: true,
      totalAmount: true,
    },
  });
  // 3. Gelen veriyi istediğiniz formata map edin
  return fuelGroups.map((group) => ({
    fuelType: group.fuelType,
    count: group._count._all ?? 0,
    totalLiter: group._sum.liter ?? 0,
    totalAmount: group._sum.totalAmount ?? 0,
  }));
}
async function getCustomerMonthly(customerId) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  if (!customer) return null;
  // 2. Performans için sadece grafik oluşturmada gerekli olan kolonları veri tabanından çek
  const sales = await prisma.sale.findMany({
    where: { customerId },
    select: { saleDate: true, liter: true, totalAmount: true },
  });
  // 3. Çekilen ham satış verilerini ay bazında gruplayarak topla
  const grouped = sales.reduce((acc, sale) => {
    // Tarihi "YYYY-MM" formatına getirerek grup anahtarı yap (Örn: "2026-08")
    const key = sale.saleDate.toISOString().slice(0, 7);
    // Eğer bu ay için daha önce bir grup açılmadıysa ilk değerlerle oluştur
    if (!acc[key]) {
      acc[key] = { labels: key, salesCount: 0, totalLiter: 0, totalAmount: 0 };
    }
    // Mevcut ayın grubundaki toplamları güncelle
    acc[key].salesCount += 1;
    acc[key].totalLiter += sale.liter ?? 0;
    acc[key].totalAmount += sale.totalAmount ?? 0;

    return acc;
  }, {});
  // 4. Obje yapısındaki grupları diziye çevir ve eskiden yeniye doğru (kronolojik) sırala
  return Object.values(grouped).sort((a, b) =>
    a.labels.localeCompare(b.labels),
  );
}
async function getCustomerPayment(customerId) {
  const c = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  if (!c) return null;
  const paymentGroups = await prisma.sale.groupBy({
    by: ["paymentType"], // Yakıt türüne göre grupla
    where: { customerId },
    _count: {
      _all: true,
    },
    _sum: {
      liter: true,
      totalAmount: true,
    },
  });
  return paymentGroups.map((group) => ({
    paymentType: group.paymentType,
    count: group._count._all ?? 0,
    totalLiter: group._sum.liter ?? 0,
    totalAmount: group._sum.totalAmount ?? 0,
  }));
}
async function getCustomerSales(customerId) {
  const c = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      sales: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!c) return null;
  return c.sales.map((s) => ({
    ...s,
    liter: s.liter ?? 0,
    unitPrice: s.unitPrice ?? 0,
    totalAmount: s.totalAmount ?? 0,
  }));
}
async function getCustomerSummary(customerId) {
  const c = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      purchaseCount: true,
      totalLiter: true,
      totalPurchase: true,
    },
  });
  if (!c) return null;
  return {
    purchaseCount: c.purchaseCount ?? 0,
    totalLiter: c.totalLiter ?? 0,
    totalPurchase: c.totalPurchase ?? 0,
  };
}
async function createCustomer(inputData) {
  const { customerType, companyName, taxNumber, taxOffice, ...sharedFields } =
    inputData;
  // 1. Her iki durumda da ortak olan alanları temel data nesnesi yapıyoruz
  const createData = { customerType, ...sharedFields };
  // 2. Eğer durum bireysel (INDIVIDUAL) , kurumsal alanları da nesneye ekliyoruz
  if (customerType === "CORPORATE") {
    createData.companyName = companyName;
    createData.taxNumber = taxNumber;
    createData.taxOffice = taxOffice;
  }
  // 3. Tek bir ortak veri tabanı sorgusu ile müşteriyi oluşturuyoruz
  return await prisma.customer.create({
    data: createData,
  });
}
async function updateCustomer(customerId, inputData) {
  const { customerType, companyName, taxNumber, taxOffice, ...sharedFields } =
    inputData;
  const updateData = { customerType, ...sharedFields };
  if (customerType !== "INDIVIDUAL") {
    updateData.companyName = companyName;
    updateData.taxNumber = taxNumber;
    updateData.taxOffice = taxOffice;
  }
  return await prisma.customer.update({
    where: { id: customerId },
    data: updateData,
  });
}
async function changeCustomerStatus(customerId) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { status: true },
  });
  if (!customer) return null;

  const newStatus = customer.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";

  const [updatedCustomer] = await prisma.$transaction([
    prisma.customer.update({
      where: { id: customerId },
      data: { status: newStatus },
    }),
    prisma.activity.create({
      data: {
        type: "CUSTOMER_STATUS_CHANGED",
        title: `Müşteri durumu değişti: ${newStatus}`,
        description: `Müşteri durumu ${newStatus} olarak güncellendi.`,
        entityType: "Customer",
        entityId: customerId,
        severity: "LOW",
      },
    }),
  ]);

  return updatedCustomer;
}
async function deleteCustomer(customerId) {
  return prisma.customer.delete({
    where: { id: customerId },
  });
}
// Arama/filtre/sıralama/sayfalama destekli müşteri listesi
async function searchCustomers({
  page = 1,
  limit = 20,
  search,
  status,
  customerType,
  loyaltyLevel,
  city,
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
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { companyName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
    ...(customerType ? { customerType } : {}),
    ...(loyaltyLevel ? { loyaltyLevel } : {}),
    ...(city ? { city } : {}),
  };

  const numericPage = Number(page);
  const numericLimit = Number(limit);
  const skip = (numericPage - 1) * numericLimit;

  const [items, totalItems] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: numericLimit,
    }),
    prisma.customer.count({ where }),
  ]);

  return { items, totalItems };
}

module.exports = {
  getCustomersList,
  getCustomer,
  getCustomerFuel,
  getCustomerMonthly,
  getCustomerPayment,
  getCustomerSales,
  getCustomerSummary,
  createCustomer,
  updateCustomer,
  changeCustomerStatus,
  deleteCustomer,
  searchCustomers,

};
