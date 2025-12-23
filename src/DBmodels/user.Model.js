import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    fullname: {
      type: String,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
    },
    mobile_number: {
      type: String,
      unique: true,
      required: true,
    },
    profile_photo: {
      type: String,
      unique: true,
    },
    cover_photo: {
      type: String,
      unique: true,
    },
    isActive: {
      type: Boolean,
    },
    refresh_token:{
      type:String,
      unique:true
    }
  },
  { timestamps: true }
);

/* Hash password before save */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next;
});

/* Compare password (login use) */
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

/* Generate Access Token */
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRED }
  );
};

/* Generate Refresh Token */
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRED }
  );
};

export const User = mongoose.model("User", userSchema);
