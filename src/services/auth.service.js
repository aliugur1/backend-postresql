const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const ApiError = require("../utils/ApiError");

async function register({ firstName, lastName, email, phone, password }) {
  const hash = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  );
  // email/phone unique ihlali burada değil, errorHandler'da Prisma P2002 olarak yakalanır
  const user = await prisma.user.create({
    data: { firstName, lastName, email, phone, password: hash },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
    },
  });

  return user;
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } }); // select yok → password dahil
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(
      401,
      "INVALID_CREDENTIALS",
      "E-posta veya şifre hatalı.",
    );
  }

  const accessToken = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );

  delete user.password; // response'a asla eklenmesin
  return { accessToken, expiresIn: process.env.JWT_EXPIRES_IN, user };
}

module.exports = { register, login };
