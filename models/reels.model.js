import mongoose, { Schema } from "mongoose";

const reelModel = new Schema(
  {
    reelURL: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Reel = mongoose.model("Reel", reelModel);
