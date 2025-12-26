import { asyncHandler } from "../utils/asyncHandler.js";
import { Apierror } from "../utils/apierror.js";
import { User } from "../DBmodels/user.Model.js";
import jwt from "jsonwebtoken";
export const Authmiddleware = asyncHandler(async (req, res, next) => {
  try {
    const Token =
      req.headers?.cookie?.split("=")[1] ||
      req?.headers["authorization"]?.split(" ")[1];

    if (!Token) {
      throw new Apierror(401, "you are not authorized");
    }

    const verifiedToken = jwt.verify(
      Token,
      process.env.ACCESS_TOKEN_SECRET_KEY
    );
    const user = await User.findById(verifiedToken._id).select([
      " -password-email, -refresh_token, -mobile_number",
    ]);

    if (!user) {
      throw new Apierror(401, "invalid accessToken");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new Apierror(401, "invalid Token");
  }
});
