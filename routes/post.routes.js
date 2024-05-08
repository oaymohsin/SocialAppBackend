import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createNewPost,
  deletePostByPostId,
  editPost,
  getPostByPostId,
  getPostByUserId,
  likePost,
  removeLikeFromPost,
} from "../controllers/post.controller.js";
const router = express.Router();

router
  .route("/createNewPost")
  .post(verifyJWT, upload.array("postMedia", 5), createNewPost);

router.route("/likePost").post(verifyJWT, likePost);
router.route("/removePostLike").post(verifyJWT, removeLikeFromPost);
router.route("/getPostByPostId").get(verifyJWT, getPostByPostId);
router.route("/getPostByUserId").get(verifyJWT, getPostByUserId);
router.route("/deletePostByPostId").delete(verifyJWT, deletePostByPostId);
router.route("/editPost").post(verifyJWT, editPost);

export default router;
