import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    commentContent: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Posts",
    },
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
