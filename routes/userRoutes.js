const express = require("express");
const {
  signUp,
  verifyAccount,
  resendOTP,
  login,
  forgetPassword,
  resetPassword,
  changePassword,
  updateProfile,
} = require("../controllers/authController");
const { upload } = require("../multer");
const {
  getAllUser,
  deleteUser,
  getCurrentUser,
} = require("../controllers/userController");
const router = express.Router();

router.post("/signup", signUp);
router.get("/current-user", getCurrentUser);
router.post("/verify", verifyAccount);
router.post("/resendotp", resendOTP);
router.post("/login", login);
router.post("/forgetPassword", forgetPassword);
router.post("/resetPassword", resetPassword);
router.post("/changepassword", changePassword);
router.post("/update-profile", upload.single("file"), updateProfile);

router.route("/").get(getAllUser);

router.route("/:id").delete(deleteUser);

module.exports = router;
