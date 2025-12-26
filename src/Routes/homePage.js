import { asyncHandler } from "../utils/asyncHandler.js";
import { Apierror } from "../utils/apierror.js";
import { Apiresponse } from "../utils/apiResponse.js";

export const home = asyncHandler(async (req,res,next) => {
    res.json("Hello")
});
