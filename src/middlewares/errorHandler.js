// middlewares/errorHandler.js
const { Prisma } = require("@prisma/client");
const { ZodError } = require("zod");
const ApiError = require("../utils/ApiError");

module.exports = (err, req, res, next) => {
  // 1. Kendi fırlattığımız ApiError hataları
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  // 2. Zod Veri Doğrulama (Validation) hataları
  if (err instanceof ZodError) {
    const errors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Gönderilen bilgiler geçersiz.",
      errorCode: "VALIDATION_ERROR",
      errors,
    });
  }

  // 3. Prisma Veri tabanı hataları
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Benzersizlik (Unique) kısıtlaması ihlali (Örn: Aynı e-posta ile tekrar kayıt)
    if (err.code === "P2002") {
      const field = err.meta?.target?.[0] ?? "field";
      return res.status(409).json({
        success: false,
        message: `${field} zaten kayıtlı.`,
        errorCode: "DUPLICATE_ENTRY",
        errors: [{ field, message: "Bu değer zaten kullanılıyor." }],
      });
    }

    // P2025: Güncellenmek, silinmek veya bulunmak istenen kayıt veri tabanında yok
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Kayıt bulunamadı.",
        errorCode: "NOT_FOUND",
      });
    }
  }

  // 4. Bilinmeyen/Öngörülemeyen Sistem Hataları (Yazılımcı hatası, bağlantı kopması vb.)
  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Sunucu hatası oluştu.",
    errorCode: "INTERNAL_SERVER_ERROR",
  });
};
