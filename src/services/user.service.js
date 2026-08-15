const bcrypt = require("bcrypt");
const prisma = require("../config/db");
const ApiError = require("../utils/ApiError");

async function getUser(userId) {
  const u = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!u) return null;
  delete u.password;
  return { ...u };
}

async function updateUser(userId, inputData) {
  const u = await prisma.user.update({
    where: { id: userId },
    data: inputData,
  });
  delete u.password;
  return { ...u };
}

async function changeUserPassword(userId, { currentPassword, password }) {
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

  return true;
}

module.exports = {
  getUser,
  changeUserPassword,
  updateUser,
};
