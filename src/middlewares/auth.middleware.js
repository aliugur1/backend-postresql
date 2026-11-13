const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  // 1. Gelen isteğin headers da "Bearer <token>" var mı kontrol et
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // "Bearer" kelimesini atıp sadece token'ı alıyoruz
  }
  // Token hiç gönderilmediyse engelle
  if (!token) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Bu işlemi yapmak için yetkiniz yok. Lütfen giriş yapın.",
      });
  }
  try {
    // 2. Token'ı .env'deki gizli şifre ile doğrula (Verify)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // 3. Token içindeki kullanıcı ID'si veri tabanında hala var mı kontrol et
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, role: true, firstName: true, lastName: true }, // Sadece ihtiyacımız olanları seçiyoruz
    });
    if (!currentUser) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Bu token'a ait kullanıcı artık sistemde mevcut değil.",
        });
    }
    // 4. Kullanıcı bilgilerini istek nesnesine (req) ekle (Böylece controller içinden req.user yazarak erişebiliriz)
    req.user = currentUser;
    next(); // Her şey yolunda, bir sonraki aşamaya (Controller'a) geçebilirsin
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Geçersiz veya süresi dolmuş token." });
  }
});
// Kullanım: router'da protect'ten SONRA eklenir, örn. restrictTo("ADMIN").
// (...roles) => middleware döndüren bir fabrika fonksiyonu, böylece route'a
// göre farklı roller verilebilir: restrictTo("ADMIN"), restrictTo("ADMIN", "MANAGER") gibi.
// req.user.role, protect middleware'inin token'dan çözüp req'e koyduğu bilgiden geliyor.
exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Bu işlem için yetkiniz yok.",
      errorCode: "FORBIDDEN",
    });
  }
  next();
};