import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createNewPost } from "../controllers/post.controller.js";
const router = express.Router();

router
  .route("/createNewPost")
  .post(verifyJWT, upload.array("postMedia", 5), createNewPost);

export default router;
