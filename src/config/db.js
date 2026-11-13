// 1. Prisma ORM'in sorguları çalıştırmamızı sağlayan ana sınıfını içeri aktarıyoruz.
const { PrismaClient } = require("@prisma/client");
// 2. Prisma 7'de PostgreSQL'e bağlanmak için zorunlu hale gelen "driver adapter"ı içeri aktarıyoruz.
const { PrismaPg } = require("@prisma/adapter-pg");

// 3. Adapter'ı .env'deki DATABASE_URL ile oluşturuyoruz — asıl PostgreSQL bağlantı bilgisi burada.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// 4. Singleton Mimarisi: Node.js'in global hafızasında daha önce oluşturulmuş bir bağlantı var mı diye bakıyoruz.
// Eğer varsa onu kullanıyor (global.__prisma), yoksa adapter'ı vererek sıfırdan yeni bir bağlantı başlatıyoruz.
const prisma = global.__prisma || new PrismaClient({ adapter });

// 5. Ortam Kontrolü: Eğer proje canlı ortamda (production) DEĞILSE (yani geliştirme/development aşamasındaysa);
// Oluşturduğumuz bu bağlantıyı global hafızaya kaydediyoruz (global.__prisma = prisma).
// Bu sayede Nodemon kodu her yenilediğinde veri tabanına boş yere YEPYENI bir bağlantı açılmasını ve sistemin şişmesini engelliyoruz.
if (process.env.NODE_ENV !== "production") global.__prisma = prisma;

// 6. Projenin diğer dosyalarında (controller, service, middleware vb.) veri tabanı sorguları yapabilmek için
// bu güvenli ve tekil (singleton) prisma nesnesini dışarıya ihraç ediyoruz.
module.exports = prisma;
