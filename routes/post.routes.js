import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createNewPost, likePost, removeLikeFromPost } from "../controllers/post.controller.js";
const router = express.Router();

router
  .route("/createNewPost")
  .post(verifyJWT, upload.array("postMedia", 5), createNewPost);

router.route("/likePost").post(verifyJWT, likePost);
router.route("/removePostLike").post(verifyJWT, removeLikeFromPost);

export default router;
