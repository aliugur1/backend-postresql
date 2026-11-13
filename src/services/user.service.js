const bcrypt = require("bcrypt");
const prisma = require("../config/db");
const ApiError = require("../utils/ApiError");

async function getUser(userId) {
  const u = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!u) return null;
  // password hash'i asla response'a gitmesin diye burada siliyoruz
  delete u.password;
  return { ...u };
}

async function updateUser(userId, inputData) {
  const u = await prisma.user.update({
    where: { id: userId },
    data: inputData,
  });
  // prisma.update() de tüm kolonları (password dahil) döndürür, aynı sebeple siliyoruz
  delete u.password;
  return { ...u };
}

async function changeUserPassword(userId, { currentPassword, password }) {
  // Şifre karşılaştırması yapabilmek için hash'i özellikle select ile çekiyoruz
  // (getUser'daki gibi tüm kolonları çekip sonra silmek yerine)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });
  if (!user) return null;

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Mevcut şifre hatalı.");
  }

  const hash = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  );

  await prisma.user.update({
    where: { id: userId },
    data: { password: hash },
  });

  // Controller'daki "if (!changed) 404" kontrolü çalışsın diye başarılı
  // işlemde açıkça true döndürüyoruz — return unutulursa undefined döner
  // ve şifre değişse bile controller yanlışlıkla 404 fırlatır
  return true;
}

module.exports = {
  getUser,
  changeUserPassword,
  updateUser,
};
