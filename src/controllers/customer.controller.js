const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { success, list } = require("../utils/apiResponse");
const customerService = require("../services/customer.service");

exports.getCustomerList = asyncHandler(async (req, res) => {
  const customerList = await customerService.getCustomersList();
  return success(res, {
    message: "Müşteri listesi getirildi.",
    data: customerList,
  });
});
exports.getCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;

  const keys = [
    "customer",
    "fuelDistribution",
    "monthlyChart",
    "paymentDistribution",
    "recentSales",
    "summary",
  ];
  const results = await Promise.all([
    customerService.getCustomer(customerId),
    customerService.getCustomerFuel(customerId),
    customerService.getCustomerMonthly(customerId),
    customerService.getCustomerPayment(customerId),
    customerService.getCustomerSales(customerId),
    customerService.getCustomerSummary(customerId),
  ]);
  const data = Object.fromEntries(keys.map((key, i) => [key, results[i]]));

  return success(res, { message: "veriler getirildi.", data });
});
// Arama/filtre/sıralama/sayfalama destekli pompa listesi
exports.searchCustomers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const { items, totalItems } = await customerService.searchCustomers(req.query);

  return list(res, {
    message: "Müşteri listesi getirildi.",
    data: items,
    page,
    limit,
    totalItems,
  });
});
// Yeni müşteri oluşturur
exports.createCustomer = asyncHandler(async (req, res) => {
  const newCustomer = await customerService.createCustomer(req.body);
  return success(res, {
    status: 201,
    message: "Müşteri oluşturuldu.",
    data: newCustomer,
  });
});
// Müşteri bilgilerini günceller
exports.updateCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;

  const customerExists = await customerService.getCustomer(customerId);
  if (!customerExists) {
    throw new ApiError(404, "NOT_FOUND", "Müşteri bulunamadı.");
  }

  const updatedCustomer = await customerService.updateCustomer(customerId, req.body);
  return success(res, {
    message: "Müşteri güncellendi.",
    data: updatedCustomer,
  });
});

// Müşteri durumunu ACTIVE <-> PASSIVE olarak değiştirir (toggle)
exports.changeCustomerStatus = asyncHandler(async (req, res) => {
  const { customerId } = req.params;

  const updatedCustomer = await customerService.changeCustomerStatus(customerId);
  if (!updatedCustomer) {
    throw new ApiError(404, "NOT_FOUND", "Müşteri bulunamadı.");
  }

  return success(res, {
    message: "Müşteri durumu güncellendi.",
    data: updatedCustomer,
  });
});
// Müşteriyi siler
exports.deleteCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;

  const customerExists = await customerService.getCustomer(customerId);
  if (!customerExists) {
    throw new ApiError(404, "NOT_FOUND", "Müşteri bulunamadı.");
  }

  await customerService.deleteCustomer(customerId);
  return success(res, { message: "Müşteri silindi." });
});
