import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    postBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postContent: {
      type: String,
    },
    postImages: [
      {
        type: String,
      },
    ],
    Likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Posts = mongoose.model("Posts", postSchema);
