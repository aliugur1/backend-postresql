const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const customerController = require("../controllers/customer.controller");

const {
  customerIdParamSchema,
  createCustomerSchema,
  updateCustomerSchema,
} = require("../schemas/customer.schema");

router.get("/", protect, customerController.getCustomerList);
router.get("/search", protect, customerController.searchCustomers);

router.get(
  "/:customerId",
  protect,
  validate(customerIdParamSchema, "params"),
  customerController.getCustomer,
);

router.post(
  "/",
  protect,
  validate(createCustomerSchema),
  customerController.createCustomer,
);

router.put(
  "/:customerId",
  protect,
  validate(customerIdParamSchema, "params"),
  validate(updateCustomerSchema),
  customerController.updateCustomer,
);

router.patch(
  "/:customerId/status",
  protect,
  validate(customerIdParamSchema, "params"),
  customerController.changeCustomerStatus,
);
router.delete(
  "/:customerId",
  protect,
  validate(customerIdParamSchema, "params"),
  customerController.deleteCustomer,
);

module.exports = router;
