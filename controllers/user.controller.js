import { asyncHandler } from "../utils/asyncHandler";
import { apiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, userName, email, password } = req.body;

  if (
    [fullname, userName, email, password].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new apiError(400, "All fields are required for registration");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new apiError(409, "User with username or email already exists");
  }

  let profileImagePath = req.files?.profileImage?.path;

  if (!profileImagePath) {
    throw new apiError(400, "profile image is required");
  }

  const profileImage = await uploadOnCloudinary(profileImagePath);

  if (!profileImage) {
    throw new apiError(400, "profile image is required");
  }

  const user = await User.create({
    fullname,
    email,
    password,
    userName: userName.toLowerCase(),
    profileImage: profileImage,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new apiError(500, "something went wrong while registration");
  }

  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "User Registered Successfully"));
});

export { registerUser };
