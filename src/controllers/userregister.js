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
export const registerUser = asyncHandler(async (req, res) => {
  const {
    username,
    mobile_number,
    Profile_Image,
    coverImage,
    fullname,
    password,
    email,
  } = req.body;

  // checking req body input is empty or not
  if (
    [username, fullname, password, email, mobile_number].some(
      (e) => e?.trim() === ""
    )
  ) {
    throw new Apierror(406, "please check all field....");
  }

  // checking  including digits or not if not digits throw error
  if (!isValid_username(username)) {
    throw new Apierror(
      406,
      "username is not secure please input secure username and add some digits in last"
    );
  }

  // checking password before saving
  if (password.length < 8 || password.length > 20) {
    throw new Apierror(
      406,
      "Please fill a strong password (between 8 and 20 characters)."
    );
  }

  //checking mobile_number length
  if (!isValid_mobile_number(mobile_number)) {
    throw new Apierror(406, "mobile number is not correct");
  }

  // //finding user in database and output will be without selection arrey
  const existing_user = await User.findOne({
    $or: [{ username }, { email }],
  });

  // checking user is already exist in database or not
  if (existing_user) {
    throw new Apierror(400, "user already exist please Login");
  }
  //profile image
  const Profile_Image_path = req?.files?.Profile_Image[0]?.path;
  //coverimage
  const cover_image_path = req?.files?.Profile_Image[0]?.path;

  //uploading profile on cloudinary
  const profileimage = await cloudinary(Profile_Image_path);
  //uploading coverimage on cloudinary
  const coverimage = await cloudinary(cover_image_path);

  //storing pmregistered user in database
  const createduser = await User.create({
    username,
    fullname: fullname || "",
    email,
    mobile_number,
    password,
    profile_photo: profileimage,
    cover_photo: coverimage,
  });

  const data = [createduser];
  res.status(201).json(new Apiresponse(201, data, "user created successfully"));
});
