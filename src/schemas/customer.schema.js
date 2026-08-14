const { z } = require("zod");

const customerIdParamSchema = z.object({
  customerId: z.string().uuid("Geçerli bir müşteri ID'si giriniz."),
});
const { CustomerStatus, LoyaltyLevel } = require("@prisma/client");
const commonFields = {
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  phone: z.string().regex(/^[0-9]{11}$/, "Telefon numarası 11 haneli olmalı"),
  plateNumber: z
    .string()
    .optional()
    .transform((val) => (val ? val.toUpperCase().replace(/\s+/g, "") : val)),
  city: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  status: z.nativeEnum(CustomerStatus).optional(),
  loyaltyLevel: z.nativeEnum(LoyaltyLevel).optional(),
  notes: z.string().optional(),
};
const createCustomerSchema = z.discriminatedUnion("customerType", [
  z.object({
    customerType: z.literal("INDIVIDUAL"),
    firstName: z.string().min(1, "Adınız gereklidir"),
    lastName: z.string().min(1, "Soyadınız gereklidir"),
    ...commonFields,
  }),
  z.object({
    customerType: z.literal("CORPORATE"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    companyName: z.string().min(1, "Firma adı gereklidir"),
    taxNumber: z.string().min(1, "Vergi numarası gereklidir"),
    taxOffice: z.string().optional(),
    ...commonFields,
  }),
]);
const updateCustomerSchema = z.discriminatedUnion("customerType", [
  z.object({
    customerType: z.literal("INDIVIDUAL"),
    firstName: z.string().min(1, "Adınız gereklidir"),
    lastName: z.string().min(1, "Soyadınız gereklidir"),
    ...commonFields,
  }),
  z.object({
    customerType: z.literal("CORPORATE"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    companyName: z.string().min(1, "Firma adı gereklidir"),
    taxNumber: z.string().min(1, "Vergi numarası gereklidir"),
    taxOffice: z.string().optional(),
    ...commonFields,
  }),
]);
const changeCustomerStatus = z.object({
  status: z.nativeEnum(CustomerStatus),
});

module.exports = {
  customerIdParamSchema,
  createCustomerSchema,
  updateCustomerSchema,
  changeCustomerStatus,
};
