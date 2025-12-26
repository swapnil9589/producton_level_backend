console.clear();
import { Apierror } from "../utils/apierror.js";
import { Apiresponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../DBmodels/user.Model.js";
import { cloudinary } from "../utils/cloudinary.js";

import {
  isValid_mobile_number,
  isValid_username,
} from "../utils/digitchecker.js";
//----------------------------------------------------------------------------------------------------------------------------------------
export const registerUser = asyncHandler(async (req, res) => {
  const { username, fullname, mobile_number, password, email } = req.body;

  // checking req body input is empty or not
  if ([username, password, email, mobile_number].some((e) => e?.trim() === ""))
    throw new Apierror(406, "All credential required");

  // checking  including digits or not if not digits throw error
  if (!isValid_username(username)) {
    throw new Apierror(
      406,
      "username is not secure please input secure username and add some digits in last"
    );
  }

  // checking password before saving
  if (password.length < 8 || password.length > 20)
    throw new Apierror(
      406,
      "Please fill strong password (between 8 to 20 characters)."
    );

  //checking mobile_number length
  if (!isValid_mobile_number(mobile_number))
    throw new Apierror(406, "mobile number is not correct");

  // //finding user in database and output will be without selection arrey
  const existing_user = await User.findOne({
    $or: [{ username }, { email }],
  }).select([
    "-_id",
    "-password",
    "-createdAt",
    "-updatedAt",
    "-fullname",
    "-refresh_token",
  ]);

  // checking user is already exist in database or not
  if (existing_user) throw new Apierror(400, "user already exist");

  //storing registered user in database
  const created_user = await User.create({
    username,
    fullname,
    email,
    mobile_number,
    password,
  });

  const data = [
    created_user.username,
    created_user.email,
    created_user.mobile_number,
  ];
  res.status(201).json(new Apiresponse(201, data, "user created successfully"));

  //storing profile if exist
  let profileimage;
  let image_url;
  if (
    Array.isArray(await req?.files?.Profile_Image) &&
    req.files.Profile_Image[0].path &&
    req.files
  ) {
    profileimage = await req.files.Profile_Image[0].path;
    image_url = await cloudinary(profileimage);
  }

  //storing coverimage if exist
  let coverimage;
  let coverimage_url;
  if (
    Array.isArray(await req?.files?.coverImage) &&
    req.files.coverImage[0].path &&
    req.files
  ) {
    coverimage = await req.files.coverImage[0].path;
    coverimage_url = await cloudinary(coverimage);
  }
  //gnerating refreshtoken
  const refreshtoken = await created_user.generateRefreshToken();
  //find user and saving refresh token in user db
  const user = await User.findByIdAndUpdate(
    created_user._id,
    {
      $set: {
        profile_photo: image_url,
        cover_photo: coverimage_url,
        refresh_token: refreshtoken,
      },
    },
    { new: true }
  );

  if (image_url || coverimage_url)
    console.log("\n", "Data uploaded successfully on database%%%-----", user);
});
//------------------------------------------------------------------------------------------------------------------
export const Login = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!password || (!username && !email)) {
    throw new Apierror(406, "please check password username/email ");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new Apierror(404, "User not found please SignUp");
  }
  //comparing user given password with hashing password in database
  const verified_password = await user.isPasswordCorrect(password);

  //checking user password correct or not
  if (!verified_password) {
    throw new Apierror(404, "Invalid password");
  }
  const AccessToken = await user.generateAccessToken();
  const data = await User.findOne(user._id).select(["-password"]);

  return res
    .status(200)
    .cookie("token", AccessToken, { httpOnly: true, secure: true })
    .json(new Apiresponse(200, AccessToken, "login successfully"));
});
// -----------------------------------------------------------------------------------------------------------------
export const passwordChange = asyncHandler(async (req, res) => {
  const { email, username, password, confirm_password } = req.body;

  if (password !== confirm_password) {
    throw new Apierror(409, "your password and confrim password is diffrent");
  }
  if (!(email || username)) {
    throw new Apierror(404, "please provide detail for username change");
  }
  if (!password) {
    throw new Apierror(404, "please input password for change");
  }
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new Apierror(404, "invalid username or email");
  }

  user.password = password;
  await user.save();
  if (!user) {
    throw new Apierror(
      404,
      "please check your credential user not find in database"
    );
  }
  res.status(200).json(new Apiresponse(200, "password change successfully "));
});

export const sample = (req, res) => {
  let image;

  res.end("wait");
};

//--------------------------------------------------------------------------------------------------------
//password change controller
export const changeemail = asyncHandler(async (req, res) => {
  const { username } = req.body;
  let { mobile_number } = req.body;
  mobile_number.toString();
  if (!(mobile_number || username)) {
    throw new Apierror(
      404,
      "please provide username or email for email change"
    );
  }
  //verifying user given data avilable in DB or not
  const user = await User.findOne({
    $or: [{ username }, { mobile_number }],
  }).select(["mobile_number", "username", "email"]);
  if (!user) {
    throw new Apierror(404, "your email or mobile_number is invalid");
  }
  res.send(new Apiresponse(200, user, "your email fetch successfully"));
});
//-----------------------------------------------------------------------------------------------
export const profile = asyncHandler(async (req, res) => {
  let profile;
  res.send(new Apiresponse(200, "uplaoded successfully"));
  if (req.files?.profile_photo[0]?.path) {
    profile = req.files?.profile_photo?.[0].path;
  }
  let coverimage;
  if (req.files?.profile_photo[0]?.path) {
    coverimage = req.files?.cover_photo?.[0].path;
  }
  const cloudinaryprofile = await cloudinary(profile);
  const cloudinary_coverphoto = await cloudinary(coverimage);
  const user = await User.findByIdAndUpdate(req.user, {
    $set: [{ profile_photo }, { cover_photo }],
    new: true,
  });
  console.log(user);
});
