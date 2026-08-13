const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const dashboardService = require("../services/dashboard.service");

exports.getDashboard = asyncHandler(async (req, res) => {
  // Query parametreleri (frontend göndermezse varsayılanlar kullanılır)
  const {
    period = "30d",
    topPumpsLimit = 5,
    recentSalesLimit = 10,
    recentActivitiesLimit = 10,
  } = req.query;
  // Tüm dashboard sorgularını aynı anda başlat (birbirini beklemesinler)
  const [
    summary,
    topPumps,
    salesChart,
    fuelDistribution,
    pumpStatusDistribution,
    recentSales,
    recentActivities,
  ] = await Promise.all([
    dashboardService.getSummary(),
    dashboardService.getTopPumps(Number(topPumpsLimit)),
    dashboardService.getSalesChart(period),
    dashboardService.getFuelDistribution(),
    dashboardService.getPumpStatusDistribution(),
    dashboardService.getRecentSales(Number(recentSalesLimit)),
    dashboardService.getRecentActivities(Number(recentActivitiesLimit)),
  ]);
  return success(res, {
    message: "Dashboard verileri getirildi.",
    data: {
      summary,
      topPumps,
      salesChart,
      fuelDistribution,
      pumpStatusDistribution,
      recentSales,
      recentActivities,
    },
  });
});
