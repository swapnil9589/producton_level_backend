import { User } from "../DBmodels/user.Model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Apierror } from "../utils/apierror.js";
import { Apiresponse } from "../utils/apiResponse.js";

export const Login = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  console.log(username, email);

  if (!password || (!username && !email)) {
    throw new Apierror(406, "please check password username/email ");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  //comparing user given password with hashing password in database
  const decodedpassword = async (password) => {
    const correct_password = await user.isPasswordCorrect(password);

    decodedpassword(password);
    if (!correct_password) {
      throw new Apierror(404, "password invalid please check password");
    }
  };

  //checking user password correct or not
  if (!user) {
    throw new Apierror(409, "please SignUp you are new user");
  }

  const data = await user
    .findOne(user._id)
    .select([
      "-mobile_number",
      "-createdAt",
      "-updatedAt",
      "-fullname",
      "-_id",
    ]);

  return res.status(200).json(new Apiresponse(200, data, "login successfully"));
});
