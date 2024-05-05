import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Post } from "../models/posts.model.js";
import { User } from "../models/user.model.js";

const createNewPost = asyncHandler(async (req, res) => {
  // post media is not required because sometime user
  // only post text post

  const postBy=req.user._id;
  const { postText } = req.body;

  if([postBy,postText].some((field)=>{
    field===""
  })){
    throw new apiError(400,"All fields are Required")
  }

  const checkUser=await User.findById(postBy)
  if(!checkUser){
    throw new apiError(404,"User does not exist")
  }

  //problem ye hai k mjy ni pta k user ny ktni images add
//   ki hain 

const arrayOfLocalFilePaths= req.files;
const postMediaLocalPaths=[]
arrayOfLocalFilePaths.forEach(file => {
    postMediaLocalPaths.push(file.path)
});

// in sb files ko cloudinary py upload kro aur url db mn save krvao 

return res.status(200)
.json(new apiResponse(200,postMediaLocalPaths,"all local paths fetched"))




});

export { createNewPost };
