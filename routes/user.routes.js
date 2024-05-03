import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  editUser,
  getAllUsers,
  getUserById,
  loginUser,
  registerUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.route("/register").post(upload.single("profileImage"), registerUser);
router.route("/login").post(loginUser);
router.route("/getAllUsers").get(getAllUsers);
router.route("/getUserById").get(verifyJWT, getUserById);
router.route("/updateUser").post(verifyJWT,upload.single("profileImage"), editUser);

export default router;
