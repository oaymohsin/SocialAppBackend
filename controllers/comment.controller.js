import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Comment } from "../models/comments.model.js";
import { Post } from "../models/posts.model.js";

const createComment = asyncHandler(async (req, res) => {
  const user = req.user._id;
  const { commentContent, post } = req.body;

  if ([commentContent, post].some((field) => !field || field.trim() === "")) {
    throw new apiError(404, "all the fields are required for comment");
  }

  const getPost = await Post.findById(post);

  if (!getPost) {
    throw new apiError(400, "post does not exist");
  }

  const comment = await Comment.create({
    commentContent,
    user,
    post: getPost._id,
  });

  return res
    .status(200)
    .json(new apiResponse(200, comment, "Comment added successfully"));
});

const fetchPostComments = asyncHandler(async (req, res) => {
  const { postId } = req.body;
  if (!postId) {
    throw new apiError(400, "postId is required");
  }
  const findComments = await Comment.find({ post: postId });

  return res
    .status(200)
    .json(
      new apiResponse(200, findComments, "all comments fetched successfully")
    );
});


const deleteComment=asyncHandler(async(req,res)=>{

    //whenever any post got deleted then delete all comments of that post
    const { commentId } = req.body;
  if (!commentId) {
    throw new apiError(400, "commentId is required");
  }
  const deleteComment= await Comment.findByIdAndDelete(commentId)
  if(!deleteComment){
    throw new apiError(500,"error in comment deletion")
  }
  return res.status(200).json(new apiResponse(200,null,"comment deleted Successfully"))
})

export { createComment,fetchPostComments,deleteComment };
