const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const authService = require("../services/auth.service");

// POST /api/auth/register — yeni kullanıcı kaydı
exports.register = asyncHandler(async (req, res) => {
  // req.body, router'da registerSchema ile önceden doğrulanmış olacak
  const user = await authService.register(req.body);
  return success(res, {
    message: "Kayıt başarılı.",
    data: { user },
    // yeni kayıt oluşturulduğu için 200 değil 201 Created dönüyoruz
    status: 201,
  });
});

// POST /api/auth/login — giriş yapıp JWT access token üretme
exports.login = asyncHandler(async (req, res) => {
  // authService.login zaten user.password'ü silip döndürüyor, burada tekrar uğraşmıyoruz
  const { accessToken, expiresIn, user } = await authService.login(req.body);
  return success(res, {
    message: "Giriş başarılı.",
    data: { accessToken, expiresIn, user },
  });
});
