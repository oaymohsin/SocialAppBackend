import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Post } from "../models/posts.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createNewPost = asyncHandler(async (req, res) => {
  // post media is not required because sometime user
  // only post text post

  const postBy = req.user._id;
  const { postText } = req.body;

  if (
    [postBy, postText].some((field) => {
      field === "";
    })
  ) {
    throw new apiError(400, "All fields are Required");
  }

  const checkUser = await User.findById(postBy);
  if (!checkUser) {
    throw new apiError(404, "User does not exist");
  }

  //problem ye hai k mjy ni pta k user ny ktni images add
  //   ki hain

  const arrayOfLocalFilePaths = req.files;
  const postMediaLocalPaths = [];
  arrayOfLocalFilePaths.forEach((file) => {
    postMediaLocalPaths.push(file.path);
  });

  const filesCloudinaryUrls = [];
  const uploadPromises = postMediaLocalPaths.map(async (localFilePath) => {
    const imageUrl = await uploadOnCloudinary(localFilePath);
    filesCloudinaryUrls.push(imageUrl?.url);
  });

  try {
    await Promise.all(uploadPromises);
    const post = await Post.create({
      postBy,
      postText,
      postMedia: filesCloudinaryUrls,
    });

    const createdPost = await Post.findById(post._id);
    if (!createdPost) {
      throw new apiError(404, "post not found");
    }

    return res
      .status(200)
      .json(new apiResponse(200, createdPost, "post created Successfully"));
  } catch (error) {
    // Handle any error that occurred during the upload process
    throw new apiError(500, error.message);
  }
});

const likePost = asyncHandler(async (req, res) => {
  //like krny valy ki id access token sy get kry gy
  //js post ko like kr ry hain vo postId body sy ay gi
  //check kro k post exist krti hai k ni against incoming id
  //agra ni krti to error throw kro
  // agar mil jy to find by Id and update kro $push kro likes field mn like krny valy ki Id

  const userId = req.user._id;
  const { postId } = req.body;
  if (!postId) {
    throw new apiError(404, "post Id required");
  }

  const checkPost = await Post.findById(postId);

  if (!checkPost) {
    throw new apiError(404, "wrong postId");
  }

  const postLiked = await Post.findByIdAndUpdate(
    checkPost._id,
    {
      $addToSet: { Likes: userId },
    },
    { new: true }
  );

  if (!postLiked) {
    throw new apiError(404, "Error occured during post liking");
  }
  return res.status(200).json(new apiResponse(200, postLiked, "Post liked"));
});

const removeLikeFromPost = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { postId } = req.body;
  if (!postId) {
    throw new apiError(404, "post Id required");
  }

  const checkPost = await Post.findById(postId);

  if (!checkPost) {
    throw new apiError(404, "wrong postId");
  }

  //check kro k iss post k likes list mn ye user hai b k ni
  if (!checkPost?.Likes?.includes(userId)) {
    throw new apiError(401, "this user did not like this post");
  }
  const removePostLike = await Post.findByIdAndUpdate(
    checkPost._id,
    {
      $pull: { Likes: userId },
    },
    { new: true }
  );

  if (!removePostLike) {
    throw new apiError(404, "Error occured during removing post like");
  }
  return res
    .status(200)
    .json(new apiResponse(200, removePostLike, "Post like removed"));
});

const getPostByPostId = asyncHandler(async (req, res) => {
  //get postId from req body
  //if not then throw error that post Id is required
  //search post through postId and return if found otherwise throw error

  const { postId } = req.body;

  if (!postId) {
    throw new apiError(404, "postId is required");
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new apiError(404, "Post not exist");
  }

  return res
    .status(200)
    .json(new apiResponse(200, post, "Post fetched successfully"));
});

const getPostByUserId = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const getUserPosts = await Post.find({ postBy: userId });

  if (getUserPosts.length < 1) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "This User has no Post"));
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, getUserPosts, "User Posts fethched Successfully")
    );
});

const deletePostByPostId = asyncHandler(async (req, res) => {
  const { postId } = req.body;

  if (!postId) {
    throw new apiError(404, "postId is required");
  }

  const deletePost = await Post.findByIdAndDelete(postId);

  if (!deletePost) {
    throw new apiError(404, "Error in post deletion");
  }

  return res
    .status(200)
    .json(new apiResponse(200, null, "Post Deleted successfully"));
});

const editPost = asyncHandler(async (req, res) => {
  //we will allow user  to edit post Text only
  const { postId, postText } = req.body;

  if (!postId || !postText) {
    throw new apiError(404, "postId and Edited Post text is required");
  }

  const editPost = await Post.findByIdAndUpdate(
    postId,
    {
      $set: { postText: postText },
    },
    { new: true }
  );

  if (!editPost) {
    throw new apiError(404, "Error during Post editing");
  }

  return res
    .status(200)
    .json(new apiResponse(200, editPost, "Post edited successfully"));
});


export {
  createNewPost,
  likePost,
  removeLikeFromPost,
  getPostByPostId,
  getPostByUserId,
  deletePostByPostId,
  editPost
};
