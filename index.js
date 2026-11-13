// .env dosyasındaki değişkenleri process.env'e yükle — diğer her şeyden önce çalışmalı
require("dotenv").config();
require("./src/config/env"); // eksik env varsa burada fırlar, uygulama hiç açılmaz

// Express uygulamasının kurulduğu yer (middleware'ler, route'lar, errorHandler)
const app = require("./src/app");
// Kapanışta DB bağlantısını temiz kesebilmek için prisma client'a ihtiyacımız var
const prisma = require("./src/config/db");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});

// Beklenmeyen (yakalanmamış) senkron hatalar — bir daha yakalanamayacağı için süreci güvenli şekilde kapat
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Yakalanmamış Promise reddleri (örn. birileri bir yerde .catch() unuttu)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

// Graceful shutdown: deploy sırasında container/process durdurulduğunda
// (SIGTERM: Docker/PM2/Kubernetes durdurma sinyali, SIGINT: Ctrl+C)
// aktif bağlantıları ve DB connection'ı düzgün kapat, yarım kalan işlem/veri kaybı olmasın
const shutdown = async (signal) => {
  console.log(`${signal} alındı, sunucu kapatılıyor...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Sunucu ve DB bağlantısı kapatıldı.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
