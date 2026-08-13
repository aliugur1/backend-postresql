const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const dashboardController = require("../controllers/dashboard.controller");

// GET /api/dashboard -> önce token kontrolü (protect), sonra dashboard verileri
router.get("/", protect, dashboardController.getDashboard);

module.exports = router;
