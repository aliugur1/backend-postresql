const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const customerController = require("../controllers/customer.controller");

const {
  customerIdParamSchema,
  createCustomerSchema,
  updateCustomerSchema,
} = require("../schemas/customer.schema");

// Okuma (GET) işlemleri: giriş yapmış her kullanıcı erişebilir, rol farkı yok
router.get("/", protect, customerController.getCustomerList);
router.get("/search", protect, customerController.searchCustomers);

router.get(
  "/:customerId",
  protect,
  validate(customerIdParamSchema, "params"),
  customerController.getCustomer,
);

// Oluşturma/güncelleme/silme: sadece ADMIN.
// Sıralama önemli: önce protect (kimlik), sonra restrictTo (yetki),
// en son validate (veri) — yetkisiz kullanıcı geçersiz veri göndersin göndermesin
// önce 403 alsın, boşuna body doğrulaması çalışmasın.
router.post(
  "/",
  protect,
  restrictTo("ADMIN"),
  validate(createCustomerSchema),
  customerController.createCustomer,
);

router.put(
  "/:customerId",
  protect,
  restrictTo("ADMIN"),
  validate(customerIdParamSchema, "params"),
  validate(updateCustomerSchema),
  customerController.updateCustomer,
);

router.patch(
  "/:customerId/status",
  protect,
  restrictTo("ADMIN"),
  validate(customerIdParamSchema, "params"),
  customerController.changeCustomerStatus,
);
router.delete(
  "/:customerId",
  protect,
  restrictTo("ADMIN"),
  validate(customerIdParamSchema, "params"),
  customerController.deleteCustomer,
);

module.exports = router;
