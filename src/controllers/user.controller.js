const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { success } = require("../utils/apiResponse");
const userService = require("../services/user.service");

exports.getUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await userService.getUser(userId);
  return success(res, { message: "veriler getirildi", data: { user } });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updateUser = await userService.updateUser(userId, req.body);
  return success(res, {
    message: "kullanıcı güncellendi",
    data: updateUser,
  });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const changed = await userService.changeUserPassword(userId, req.body);
  if (!changed) {
    throw new ApiError(404, "NOT_FOUND", "Kullanıcı bulunamadı.");
  }
  return success(res, {
    message: "Kullanıcı şifresi değiştirildi",
  });
});
