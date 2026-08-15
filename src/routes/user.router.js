const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const userController = require("../controllers/user.controller");

const {
  changePasswordSchema,
  updateUserSchema,
} = require("../schemas/user.schema");

router.get(
  "/",
  protect,
  userController.getUser,
);
router.put(
  "/profile",
  protect,
  validate(updateUserSchema),
  userController.updateUser,
);
router.patch(
  "/change-password",
  protect,
  validate(changePasswordSchema),
  userController.changePassword,
);
