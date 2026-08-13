// Zod şemasıyla req.body / req.query / req.params doğrulama middleware'i
// Hata olursa next(err) ile ZodError, errorHandler.middleware.js'e düşer ve orada formatlanır
module.exports = (schema, source = "body") => (req, res, next) => {
  try {
    req[source] = schema.parse(req[source]);
    next();
  } catch (err) {
    next(err);
  }
};
