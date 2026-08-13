const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const dashboardService = require("../services/dashboard.service");

exports.getDashboard = asyncHandler(async (req, res) => {
  const {
    period = "30d",
    topPumpsLimit = 5,
    recentSalesLimit = 10,
    recentActivitiesLimit = 10,
  } = req.query;
  // Promise.all içine nesne anahtarlarını (keys) doğrudan eşliyoruz
  const keys = [
    "summary",
    "topPumps",
    "salesChart",
    "fuelDistribution",
    "pumpStatusDistribution",
    "recentSales",
    "recentActivities",
  ];

  const results = await Promise.all([
    dashboardService.getSummary(),
    dashboardService.getTopPumps(Number(topPumpsLimit)),
    dashboardService.getSalesChart(period),
    dashboardService.getFuelDistribution(),
    dashboardService.getPumpStatusDistribution(),
    dashboardService.getRecentSales(Number(recentSalesLimit)),
    dashboardService.getRecentActivities(Number(recentActivitiesLimit)),
  ]);
  // Diziyi tek hamlede dinamik olarak nesneye çeviriyoruz
  const data = Object.fromEntries(keys.map((key, i) => [key, results[i]]));

  return success(res, { message: "Dashboard verileri getirildi.", data });
});
