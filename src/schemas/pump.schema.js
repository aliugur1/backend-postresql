const { z } = require("zod");
// Route param da pumpId'nin geçerli bir UUID olduğunu doğrular
const pumpIdParamSchema = z.object({
  pumpId: z.string().uuid("Geçerli bir pompa ID'si giriniz."),
});
// status: "FAULTY" -> faultCode/faultMessage zorunlu
// status: "ACTIVE" -> nextMaintenanceAt yonel (bakım tamamlandı anlamına gelir)
const updateStatusSchema = z.discriminatedUnion("status", [
  //Koşullu Doğrulama"
  z.object({
    status: z.literal("FAULTY"), //Değerin tam olarak yazılan metne eşit olmasını şart koşar
    faultCode: z.string().min(1, "Arıza kodu gereklidir."),
    faultMessage: z.string().min(1, "Arıza açıklaması gereklidir."),
  }),
  z.object({
    status: z.literal("ACTIVE"),
    nextMaintenanceAt: z.coerce.date().optional(), //z.coerce.Tip Dönüşümü (Coercion) optional() O alanın zorunlu olmadığını
  }),
  z.object({
    status: z.literal("PASSIVE"),
  }),
  z.object({
    status: z.literal("MAINTENANCE"),
  }),
]);

module.exports = { pumpIdParamSchema, updateStatusSchema };
