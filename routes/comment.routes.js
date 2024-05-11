import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createComment,
  deleteComment,
  fetchPostComments,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.route("/createComment").post(verifyJWT, createComment);
router.route("/fetchPostComments").get(verifyJWT, fetchPostComments);
router.route("/deleteComment").delete(verifyJWT, deleteComment);

export default router;
