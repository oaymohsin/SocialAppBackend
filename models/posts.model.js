import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    postBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postText: {
      type: String,
      required: true,
    },
    postMedia: {
      type: [String],
    },
    Likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
