// 1. Prisma ORM'in sorguları çalıştırmamızı sağlayan ana sınıfını içeri aktarıyoruz.
const { PrismaClient } = require("@prisma/client");

// 2. Singleton Mimarisi: Node.js'in global hafızasında daha önce oluşturulmuş bir bağlantı var mı diye bakıyoruz.
// Eğer varsa onu kullanıyor (global.__prisma), yoksa sıfırdan yeni bir bağlantı (new PrismaClient()) başlatıyoruz.
const prisma = global.__prisma || new PrismaClient();

// 3. Ortam Kontrolü: Eğer proje canlı ortamda (production) DEĞILSE (yani geliştirme/development aşamasındaysa);
// Oluşturduğumuz bu bağlantıyı global hafızaya kaydediyoruz (global.__prisma = prisma).
// Bu sayede Nodemon kodu her yenilediğinde veri tabanına boş yere YEPYENI bir bağlantı açılmasını ve sistemin şişmesini engelliyoruz.
if (process.env.NODE_ENV !== "production") global.__prisma = prisma;

// 4. Projenin diğer dosyalarında (controller, middleware vb.) veri tabanı sorguları yapabilmek için 
// bu güvenli ve tekil (singleton) prisma nesnesini dışarıya ihraç ediyoruz.
module.exports = prisma;
