import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteCloudinaryFile,
} from "../utils/cloudinary.js";
import { getPublicId } from "../utils/getPublicIdFromURL.js";
import { hashPassword } from "../utils/hashPassword.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    console.log(user);
    if (user) {
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;

      await user.save({ validateBeforeSave: false });
      // console.log(accessToken, refreshToken);
      return { accessToken, refreshToken };
    }
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, userName, email, password } = req.body;

  if (
    [fullName, userName, email, password].some((field) => {
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

  let profileImagePath = req.file?.path;
  console.log(req.file.path);
  if (!profileImagePath) {
    throw new apiError(400, "profile image is required");
  }

  const profileImage = await uploadOnCloudinary(profileImagePath);

  if (!profileImage) {
    throw new apiError(400, "profile image from cloudinary is required");
  }

  const user = await User.create({
    fullName,
    email,
    password,
    userName: userName.toLowerCase(),
    profileImage: profileImage?.url || "",
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

//get username email and password from req.body
//agar username aur email dono empty hain to error return kro k at least one is required
// username or email ko check kro $or operator k through k exist krty hain k ni
// agar ni exist krty to error return kro
// aur agar exist krty hain to password match kro
// agar password match na ho to error return kro
// agar match ho jy to access aur refresh token generate kro
// response return kro aur cookies mn access token aur refresh token set kro

const loginUser = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;
  if (!email && !userName) {
    throw new apiError(400, "username or email is required");
  }
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (!user) {
    throw new apiError(404, "user does not exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  console.log(accessToken);
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  //refresh token ko remove kro
  //cookies mn sy access token aur refresh token ko remove kro
  await User.findByIdAndUpdate(
    userId,
    {
      $unset: {
        refreshToken: 1, //this removes field from the document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "user logged out"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -refreshToken");

  if (!users) {
    throw new apiError(400, "Error during fetching users");
  }

  return res.status(200).json(
    new apiResponse(
      200,
      {
        users,
      },
      "All users fetched successfully"
    )
  );
});

const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new apiError(404, "user Id required");
  }
  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) {
    throw new apiError(404, "User does not exist");
  }
  return res
    .status(200)
    .json(new apiResponse(200, { user }, "User fetched successfully"));
});

const editUser = asyncHandler(async (req, res) => {
  //user ny kuch b edit krna ho us k liay ye aik single endpoint hi hai
  //user sy sb fields ka data ay ga q k same form use ho ga jo register user k liay use ho ra hai
  //to sari filds k liay destructing assignment kry gy
  //new anay valy data ka aik object bana kr findbyidandupdate method k through save krva dy gy
  //image b update ho gi is liay image ko cloudinary pr upload kr k us ka url b update krna ho ga
  // aur phli vali image ko cloudinary sy delete b krna ho ga

  const userId = req.user._id;
  const userExist = await User.findById(userId);
  if (!userExist) {
    throw new apiError(400, "user does not exist");
  }

  const { fullName, userName, email, password } = req.body;

  if (
    [fullName, userName, email, password].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new apiError(400, "All fields are required for Editing");
  }

  //check kro k user image b update kr raha hai k ni

  let profileImagePath = req.file?.path;
  // console.log(req.file.path);

  let imagePath;
  if (profileImagePath) {
    const profileImage = await uploadOnCloudinary(profileImagePath);
    if (!profileImage) {
      throw new apiError(400, "profile image from cloudinary is required");
    }
    imagePath = profileImage.url;
    const filePublicId = getPublicId(userExist.profileImage);
    if (filePublicId) {
      const deleteFile = await deleteCloudinaryFile(filePublicId);
      if (!deleteFile.result == "ok") {
        throw new apiError(404, "Error in deleting file from cloudinary");
      }
    }
  } else {
    imagePath = userExist.profileImage;
  }

  //update query py save pre hook work ni krti

  const hashedPassword = await hashPassword(password);
  // console.log(hashedPassword);
  const userData = {
    userName,
    email,
    password: hashedPassword,
    fullName,
    profileImage: imagePath || "",
  };

  const editedUser = await User.findOneAndUpdate(userId, userData, {
    new: true,
  }).select("-password -refreshToken");

  // await editedUser.save();

  // const createdUser = await User.findById(user._id).select(
  //   "-password -refreshToken"
  // );

  if (!editedUser) {
    throw new apiError(500, "something went wrong while editing");
  }

  return res
    .status(201)
    .json(new apiResponse(200, editedUser, "User edited Successfully"));
});

const deleteUserById = asyncHandler(async (req, res) => {
  //id access token sy b ly skty hain
  //id body mn b bhji ja skti hai
  //user ko db sy delete kro
  //jb user delete ho jy ga to access token aur refresh token ko b cookies sy remove kr do

  //profile image ko b cloudinary sy delete krna chaiye

  const userId = req.user._id;

  const deleteUser = await User.findByIdAndDelete(userId);
  if (!deleteUser) {
    throw new apiError(404, "Error in user deletion");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "user deleted successfully"));
});

const getFriendsListById = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const findUser = await User.findById(id)
    .populate({
      path: "friendsList",
      select: "fullName profileImage",
    })
    .select("friendsList");
  if (!findUser) {
    throw new apiError(400, "Error occured in fetching friendlist");
  }
  return res
    .status(200)
    .json(new apiResponse(200, findUser, "User List fetehced successfully"));
});

const addFriend = asyncHandler(async (req, res) => {
  const friendId = req.body.friendId;
  if (!friendId) {
    throw new apiError(400, "friend Id is required");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { friendsList: friendId } },
    { new: true } // To return updated document
  );
  if (!updatedUser) {
    throw new apiError(400, "Error occured in adding friend to friendlist");
  }
  return res
    .status(200)
    .json(new apiResponse(200, updatedUser, "friend added successfully"));
});



export {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  editUser,
  logoutUser,
  deleteUserById,
  getFriendsListById,
  addFriend,
};
