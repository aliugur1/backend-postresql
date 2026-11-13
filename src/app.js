const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Hataları merkezi olarak yakalayıp formatlayan middleware (en sonda kullanılacak)
const errorHandler = require("./middlewares/errorHandler.middleware");

// Her modülün route tanımları
const userRouter = require("./routes/user.router");
const customerRouter = require("./routes/customer.router");
const dashboardRouter = require("./routes/dashboard.router");
const pumpRouter = require("./routes/pump.router");
const authRouter = require("./routes/auth.router");

const app = express();

// 1. Güvenlik başlıkları (XSS, click jacking vb. temel korumalar)
app.use(helmet());
// 2. CORS: farklı origin ler (örn. frontend) gelen isteklere izin ver
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*" }));
// 3. :Istek log lama (geliştirme sırasında her isteği terminalde görmek için)
app.use(morgan("dev"));
// 4. Gelen JSON body'yi req.body'ye parse et — bu olmadan req.body hep undefined kalır
app.use(express.json({ limit: "10kb" }));

// Route'lar burada "/api/..." ön ekiyle mount ediliyor,
// router dosyalarının içi ise "/" , "/profile" gibi göreli path ler yazılı
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/customers", customerRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/pumps", pumpRouter);


// Hata yakalayan middleware EN SONDA olmalı, yoksa hataları yakalamaz
app.use(errorHandler);

// app.listen() burada değil index.js'te çağrılıyor,
// böylece testlerde sunucuyu gerçekten dinletmeden app'i import edebiliriz
module.exports = app;
