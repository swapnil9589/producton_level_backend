console.clear();
import { Apierror } from "../utils/apierror.js";
import { Apiresponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../DBmodels/user.Model.js";
import { cloudinary } from "../utils/cloudinary.js";
import cookie from "cookie-parser";
import {
  isValid_mobile_number,
  isValid_username,
} from "../utils/digitchecker.js";
export const registerUser = asyncHandler(async (req, res) => {
  const { username, mobile_number, fullname, password, email } = req.body;

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

  //storing pmregistered user in database
  const created_user = await User.create({
    username,
    fullname: fullname || "",
    email,
    mobile_number,
    password,
  });
  // console.log(refreshtoken);

  const data = [created_user];
  res
    .status(200)
    .cookie()
    .send(new Apiresponse(201, data, "user created successfully"));

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

  const refreshtoken = await created_user.generateRefreshToken();

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
  console.log("\n", "Data uploaded successfully on database%%%-----", user);
});
