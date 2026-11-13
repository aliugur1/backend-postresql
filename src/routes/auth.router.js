const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const validate = require("../middlewares/validate.middleware");
const authController = require("../controllers/auth.controller");
const { registerSchema, loginSchema } = require("../schemas/auth.schema");

// Login'e özel rate limit: brute-force şifre denemesine karşı koruma.
// .env'deki LOGIN_RATE_LIMIT_WINDOW_MIN dakikalık pencerede en fazla
// LOGIN_RATE_LIMIT_MAX deneme hakkı tanınıyor, aşılırsa 429 döner.
const loginLimiter = rateLimit({
  windowMs: (Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MIN) || 15) * 60 * 1000,
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 5,
  message: {
    success: false,
    message: "Çok fazla giriş denemesi yaptınız. Lütfen biraz sonra tekrar deneyin.",
    errorCode: "TOO_MANY_REQUESTS",
  },
});

// POST /api/auth/register -> önce body registerSchema ile doğrulanır, sonra controller çalışır
router.post("/register", validate(registerSchema), authController.register);

// POST /api/auth/login -> önce rate limit, sonra body doğrulama, sonra controller
router.post("/login", loginLimiter, validate(loginSchema), authController.login);

module.exports = router;
