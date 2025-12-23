import { Router } from "express";
import { registerUser } from "../controllers/userregister.js";
import { Login } from "../controllers/userLogin.js";
import { upload } from "../middleware/multer.js";
import { sample } from "../controllers/Profile.js";

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
userrouters.route("/Profile").post(
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
  sample
);
userrouters.route("/Login").post(Login);
export { userrouters };
