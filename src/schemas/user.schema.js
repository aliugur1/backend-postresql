const { z } = require("zod");
const {Role}= require("@prisma/client")

// create ve update şemaları arasında ortak olan alanlar burada tek yerde tanımlı,
// ikisi de aynı kuralları kullansın diye spread (...commonFields) ile paylaşılıyor
const commonFields = {
  firstName: z.string().min(1, "Adınız gereklidir"),
  lastName: z.string().min(1, "Soyadınız gereklidir"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  phone: z.string().regex(/^[0-9]{11}$/, "Telefon numarası 11 haneli olmalı"),
  city: z.string().optional(),
  district: z.string().optional(),
  profileImageUrl: z.string().optional(),
  stationAddress: z.string().optional(),
  stationCode: z.string().optional(),
  stationName: z.string().optional(),
};
// role bilinçli olarak sadece burada, createUserSchema'da var — commonFields'a
// eklenirse updateUserSchema da miras alır ve bir kullanıcı kendi profilini
// güncellerken role: "ADMIN" gönderip kendini yetkilendirebilir (privilege escalation)
const createUserSchema = z
  .object({
    ...commonFields,
    role: z.nativeEnum(Role).optional(),
    password: z.string().min(8, "Şifre en az 8 karakter olmalıdır."),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Şifreler eşleşmiyor.",
    path: ["passwordConfirm"],
  });

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifre gereklidir"),
    password: z.string().min(8, "Şifre en az 8 karakter olmalıdır."),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Şifreler eşleşmiyor.",
    path: ["passwordConfirm"],
  });

// .partial() ile tüm alanlar opsiyonel hale geliyor — kullanıcı sadece
// değiştirmek istediği alanı gönderebilsin diye (örn. sadece city), her seferinde
// firstName/lastName/email/phone'u da göndermek zorunda kalmasın
const updateUserSchema = z.object({
  ...commonFields,
}).partial();

module.exports = {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
};
