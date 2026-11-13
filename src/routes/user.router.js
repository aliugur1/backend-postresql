const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const userController = require("../controllers/user.controller");

const {
  changePasswordSchema,
  updateUserSchema,
} = require("../schemas/user.schema");

// Bu router'daki tüm route'lar "kendi profilim" mantığıyla çalışır:
// hangi kullanıcı üzerinde işlem yapılacağı URL/params'tan değil,
// protect middleware'inin token'dan çözüp req.user.id'ye koyduğu kimlikten gelir.
// Bu yüzden burada :userId gibi bir route param YOK — biri başkasının
// id'sini URL'e yazıp onun hesabını değiştiremesin diye bilinçli olarak böyle.

// GET /api/users -> giriş yapmış kullanıcının kendi profilini getirir
router.get(
  "/",
  protect,
  userController.getUser,
);
// PUT /api/users/profile -> kendi profilini günceller (kısmi güncelleme, updateUserSchema .partial())
router.put(
  "/profile",
  protect,
  validate(updateUserSchema),
  userController.updateUser,
);
// PATCH /api/users/change-password -> mevcut şifreyi doğrulayıp yenisiyle değiştirir
router.patch(
  "/change-password",
  protect,
  validate(changePasswordSchema),
  userController.changePassword,
);
module.exports = router;
