const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const pumpController = require("../controllers/pump.controller");
const {
  pumpIdParamSchema,
  updateStatusSchema,
} = require("../schemas/pump.schema");
// GET /api/pumps -> tüm pompaların sade listesi
router.get("/", protect, pumpController.getPumpsList);
// GET /api/pumps/search -> arama/filtre/sıralama/sayfalama destekli liste
router.get("/search", protect, pumpController.searchPumps);
// GET /api/pumps/:pumpId -> tek pompanın istatistik/yakıt/bakım/satış birleşik raporu
router.get(
  "/:pumpId",
  protect,
  validate(pumpIdParamSchema, "params"),
  pumpController.getPump,
);
// PATCH /api/pumps/:pumpId/status -> tek endpoint, body'deki "status" alanına göre
// arıza bildirimi (FAULTY) veya bakım tamamlama (ACTIVE) işlemi yapar
router.patch(
  "/:pumpId/status",
  protect,
  validate(pumpIdParamSchema, "params"),
  validate(updateStatusSchema),
  pumpController.updatePumpStatus,
);

module.exports = router;
