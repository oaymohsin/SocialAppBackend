import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  addFriend,
  deleteUserById,
  editUser,
  forgotPassword,
  generateNewAccessToken,
  getAllUsers,
  getFriendsListById,
  getUserById,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  verifyCode,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = express.Router();

//User Routes
router.route("/register").post(upload.single("image"), registerUser);
router.route("/login").post(loginUser);
router.route("/getAllUsers").get(getAllUsers);
router.route("/getUserById").get(verifyJWT, getUserById);
router.route("/updateUser").post(verifyJWT, upload.single("image"), editUser);
router.route("/logoutUser").post(verifyJWT, logoutUser);
router.route("/deleteUserById").delete(verifyJWT, deleteUserById);
router.route("/getFriendsListById").get(verifyJWT, getFriendsListById);
router.route("/addFriend").post(verifyJWT, addFriend);
router.route("/forgotPassword").post(forgotPassword);
router.route("/verifyCode").post(verifyCode);
router.route("/resetPassword").post(resetPassword)
router.route("/generateNewAccessToken").post(generateNewAccessToken)
export default router;

//comment added
