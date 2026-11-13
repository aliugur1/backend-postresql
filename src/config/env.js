const { z } = require("zod");

// Uygulamanın çalışması için zorunlu olan env değişkenlerini burada listeliyoruz.
// Zorunlu olanlarda .min(1, "...") ile boş/eksikse anlamlı bir hata mesajı veriyoruz,
// zorunlu olmayanlarda ise .default(...) ile makul bir varsayılan değer tanımlıyoruz.
const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL gerekli"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET gerekli"),
  JWT_EXPIRES_IN: z.string().default("8h"),
  BCRYPT_SALT_ROUNDS: z.string().default("10"),
});

// process.env'i şemaya göre doğruluyoruz. Eksik/boş bir zorunlu değişken varsa
// zod burada hata fırlatır ve uygulama app.listen()'e hiç ulaşmadan durur —
// yani hatalı config production'a değil, geliştiricinin ekranına gider.
const env = envSchema.parse(process.env);

module.exports = env;
