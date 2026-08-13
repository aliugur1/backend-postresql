const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { success } = require("../utils/apiResponse");
const pumpService = require("../services/pump.service");
// Tüm pompaların sade listesi (ör. dashboard/liste ekranı için)
exports.getPumpsList = asyncHandler(async (req, res) => {
  const pumpsList = await pumpService.getPumpsList();
  return success(res, { message: "Pompa listesi getirildi.", data: pumpsList });
});
// Tek pompa için detay + istatistik + yakıt + bakım + satış verilerini paralel çekip birleştirir
exports.getPump = asyncHandler(async (req, res) => {
  const { pumpId } = req.params;

  const keys = [
    "pump",
    "statisticsData",
    "fuelSummaryData",
    "maintenanceData",
    "salesData",
  ];
  const results = await Promise.all([
    pumpService.getPump(pumpId),
    pumpService.getStatisticsData(pumpId),
    pumpService.getFuelSummaryData(pumpId),
    pumpService.getMaintenanceData(pumpId),
    pumpService.getSalesData(pumpId),
  ]);
  const data = Object.fromEntries(keys.map((key, i) => [key, results[i]]));

  return success(res, { message: "Verileri getirildi.", data });
});
// Frontend tek bir "status" alanı gönderiyor: FAULTY -> arıza kaydı, ACTIVE -> bakım tamamlama
exports.updatePumpStatus = asyncHandler(async (req, res) => {
  const { pumpId } = req.params;
  const { status } = req.body;

  const pumpExists = await pumpService.getPump(pumpId);
  if (!pumpExists) {
    throw new ApiError(404, "NOT_FOUND", "Pompa bulunamadı.");
  }
  const updatedPump =
    status === "FAULTY"
      ? await pumpService.reportFault(pumpId, {
          faultCode: req.body.faultCode,
          faultMessage: req.body.faultMessage,
        })
      : await pumpService.reportMaintenance(pumpId, {
          nextMaintenanceAt: req.body.nextMaintenanceAt,
        });

  return success(res, {
    message: "Pompa durumu güncellendi.",
    data: updatedPump,
  });
});
