import { asyncHandler } from "../utils/asyncHandler.js";
// import { Apierror } from "../utils/apierror.js";
// import { Apiresponse } from "../utils/apiResponse.js";

export const Profile = asyncHandler(async (req, res) => {
  const userid = req.params;

  res.json(userid);
});
