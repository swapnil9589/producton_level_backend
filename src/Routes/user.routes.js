import { Router } from "express";
import { upload } from "../middleware/multer.js";
import { Authmiddleware } from "../middleware/authorizationmiddleware.js";
import {
  registerUser,
  passwordChange,
  Login,
  changeemail,
  profile,
  logout,
} from "../controllers/userController.js";

const userrouters = Router();
userrouters.post(
  "/registerUser",
  upload.fields([
    {
      name: "Profile_Image",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
userrouters.route("/Profile").patch(
  upload.fields([
    {
      name: "profile",
      maxCount: 1,
    },
    {
      name: "cover",
      maxCount: 1,
    },
  ]),
  profile
);
userrouters.route("/Login").post(Login);
userrouters.route("/logout", Authmiddleware).get(logout);
userrouters.route("/ForgetPassword").patch(passwordChange);
userrouters.route("/forgetemail").patch(changeemail);
export { userrouters };
