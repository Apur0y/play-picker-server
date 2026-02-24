import crypto from "crypto";
import status from "http-status";
import config from "../../config";
import { Request } from "express";
import { createToken } from "./auth.utils";
import ApiError from "../../errors/ApiError";
import { hashPassword } from "../user/user.utils";
import { RefreshPayload } from "./auth.interface";
import { sendEmail } from "../../utils/sendEmail";
import { OAuth2Client } from "google-auth-library";
import { verifyToken } from "../../utils/verifyToken";
import { passwordCompare } from "../../utils/comparePasswords";
import { User } from "../user/user.model";
import { IUser, Role } from "../user/user.interface";

// simple helper to turn a mongoose user doc into plain object for JWT
const buildJwtPayload = (user: IUser & { _id: any }) => {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    picture: (user as any).picture,
    role: user.role,
    isVerified: !!user.isVerified,
  };
};

const loginUser = async (email: string, password: string, req: Request) => {
  // we need password field for comparison
  const userDoc = await User.findOne({ email }).select("+password");
  if (!userDoc) {
    throw new ApiError(status.NOT_FOUND, "User not found!");
  }

  const userObj = userDoc.toObject() as IUser & { _id: any };

  const isPasswordMatched = await passwordCompare(
    password,
    userObj.password || ""
  );
  if (!isPasswordMatched) {
    throw new ApiError(status.UNAUTHORIZED, "Password is incorrect!");
  }

  // if (!userObj.isVerified) {
  //   const accessToken = createToken(
  //     buildJwtPayload(userObj) as any,
  //     config.jwt.access.secret as string,
  //     config.jwt.resetPassword.expiresIn as string
  //   );
  //   const confirmedLink = `${config.verify.email}?token=${accessToken}`;
  //   await sendEmail(userObj.email, undefined, confirmedLink);
  //   throw new ApiError(
  //     status.UNAUTHORIZED,
  //     "User is not verified! Confirmation email sent."
  //   );
  // }

  const payload = buildJwtPayload(userObj);
  const accessToken = createToken(
    payload,
    config.jwt.access.secret as string,
    config.jwt.access.expiresIn as string
  );
  const refreshToken = createToken(
    payload,
    config.jwt.refresh.secret as string,
    config.jwt.refresh.expiresIn as string
  );

  await recordLogin(userObj, req);
  return { accessToken, refreshToken };
};


const logoutUser = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new ApiError(status.BAD_REQUEST, "No refresh token provided");
  }

  // Optional: verify refresh token first
  const decoded = verifyToken(
    refreshToken,
    config.jwt.refresh.secret as string
  );

  if (!decoded) {
    throw new ApiError(status.UNAUTHORIZED, "Invalid refresh token");
  }

  // If you store refreshToken in DB → remove it
  await User.findByIdAndUpdate(decoded.userId, {
    $unset: { refreshToken: "" },
  });

  return true;
};

const recordLogin = async (user: IUser, req: Request) => {
  // no database for login records yet - just log
  console.log("login event", { email: user.email, ip: req.ip });
};

const verifyEmail = async (token: string) => {
  const verifiedToken = verifyToken(token) as any;
  const userDoc = await User.findOne({ email: verifiedToken.email });
  if (!userDoc) throw new ApiError(status.NOT_FOUND, "User not found!");
  if (userDoc.isVerified) throw new ApiError(status.BAD_REQUEST, "User already verified!");
  userDoc.isVerified = true;
  await userDoc.save();
  return null;
};

const verifyResetPassLink = async (token: string) => {
  const verifiedToken = verifyToken(token) as any;
  const userDoc = await User.findOne({ email: verifiedToken.email }).select(
    "+isResetPassword +canResetPassword"
  );
  if (!userDoc) throw new ApiError(status.NOT_FOUND, "User not found!");
  userDoc.isResetPassword = false;
  userDoc.canResetPassword = true;
  await userDoc.save();
  return null;
};

const changePassword = async (
  email: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  const userDoc = await User.findOne({ email }).select("+password");
  if (!userDoc) throw new ApiError(status.NOT_FOUND, "User not found!");
  if (!newPassword) throw new ApiError(status.BAD_REQUEST, "New password is required!");
  if (!confirmPassword) throw new ApiError(status.BAD_REQUEST, "Confirm password is required!");
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      status.BAD_REQUEST,
      "New password and confirm password do not match!"
    );
  }

  const isPasswordMatch = await passwordCompare(
    currentPassword,
    userDoc.password || ""
  );
  if (!isPasswordMatch) {
    throw new ApiError(status.UNAUTHORIZED, "Current password is incorrect!");
  }

  const hashedNewPassword = await hashPassword(newPassword);
  userDoc.password = hashedNewPassword;
  userDoc.passwordChangedAt = new Date();
  await userDoc.save();
  return null;
};

const forgotPassword = async (email: string) => {
  const userDoc = await User.findOne({ email });
  if (!userDoc) throw new ApiError(status.NOT_FOUND, "User not found!");
  if (!userDoc.isVerified) {
    throw new ApiError(status.UNAUTHORIZED, "User account is not verified!");
  }

  userDoc.isResetPassword = true;
  userDoc.canResetPassword = false;
  await userDoc.save();

  const payload = buildJwtPayload(userDoc as any);
  const accessToken = createToken(
    payload,
    config.jwt.access.secret as string,
    config.jwt.access.expiresIn as string
  );
  const resetPassLink = `${config.verify.resetPassLink}?token=${accessToken}`;
  await sendEmail(userDoc.email, resetPassLink);

  return {
    message:
      "We have sent a Reset Password link to your email address. Please check your inbox.",
  };
};

const resetPassword = async (
  email: string,
  newPassword: string,
  confirmPassword: string
) => {
  if (newPassword !== confirmPassword) {
    throw new ApiError(status.BAD_REQUEST, "Passwords do not match!");
  }
  const userDoc = await User.findOne({ email }).select(
    "+canResetPassword +isResetPassword +password"
  );
  if (!userDoc) throw new ApiError(status.NOT_FOUND, "User not found!");
  if (!userDoc.canResetPassword) {
    throw new ApiError(
      status.BAD_REQUEST,
      "User is not eligible for password reset!"
    );
  }
  const hashedPassword = await hashPassword(newPassword);
  userDoc.password = hashedPassword;
  userDoc.canResetPassword = false;
  userDoc.isResetPassword = false;
  await userDoc.save();
  return { message: "Password reset successfully!" };
};

const resendVerificationLink = async (email: string) => {
  const userDoc = await User.findOne({ email });
  if (!userDoc) throw new ApiError(status.NOT_FOUND, "User not found!");
  if (userDoc.isVerified) {
    throw new ApiError(status.BAD_REQUEST, "User account already verified!");
  }
  const payload = buildJwtPayload(userDoc as any);
  const accessToken = createToken(
    payload,
    config.jwt.access.secret as string,
    config.jwt.access.expiresIn as string
  );
  const confirmedLink = `${config.verify.email}?token=${accessToken}`;
  await sendEmail(userDoc.email, undefined, confirmedLink);
  return {
    message:
      "New verification link has been sent to your email. Please check your inbox.",
  };
};

const resendResetPassLink = async (email: string) => {
  const userDoc = await User.findOne({ email });
  if (!userDoc) throw new ApiError(status.NOT_FOUND, "User not found!");
  userDoc.isResetPassword = true;
  await userDoc.save();
  const payload = buildJwtPayload(userDoc as any);
  const accessToken = createToken(
    payload,
    config.jwt.access.secret as string,
    config.jwt.access.expiresIn as string
  );
  const resetPassLink = `${config.verify.resetPassLink}?token=${accessToken}`;
  await sendEmail(userDoc.email, resetPassLink);
  return {
    message:
      "New Reset Password link has been sent to your email. Please check your inbox.",
  };
};

const googleLogin = async (googleToken: string, req: Request) => {
  const client = new OAuth2Client();
  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: config.google.clientId,
    });
  } catch (err) {
    throw new ApiError(status.UNAUTHORIZED, "Invalid Google token");
  }
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new ApiError(status.UNAUTHORIZED, "Google account email not found");
  }
  let userDoc = await User.findOne({ email: payload.email }).select(
    "+password"
  );
  const createdPassword = crypto.randomBytes(6).toString("hex");
  const hashedNewPassword = await hashPassword(createdPassword);
  if (!userDoc) {
    userDoc = await User.create({
      email: payload.email,
      name: `${payload.given_name || ""} ${payload.family_name || ""}`.trim(),
      picture: payload.picture || "",
      isVerified: true,
      role: Role.USER,
      password: hashedNewPassword,
    } as any);
  }

  const payloadJwt = buildJwtPayload(userDoc as any);
  const accessToken = createToken(
    payloadJwt,
    config.jwt.access.secret as string,
    config.jwt.access.expiresIn as string
  );
  const refreshToken = createToken(
    payloadJwt,
    config.jwt.refresh.secret as string,
    config.jwt.refresh.expiresIn as string
  );
  await recordLogin(userDoc as any, req);
  return { accessToken, refreshToken };
};

const getMe = async (email: string) => {
  const userDoc = await User.findOne({ email }).select("-password");
  if (!userDoc) throw new ApiError(status.NOT_FOUND, "User not found");
  return userDoc;
};

export const refreshToken = async (token: string) => {
  const decoded = verifyToken(
    token,
    config.jwt.refresh.secret as string
  ) as RefreshPayload;
  const { email, iat } = decoded;
  const userDoc = await User.findOne({ email }).select(
    "+passwordChangedAt +roleChangedAt"
  );
  if (!userDoc) throw new ApiError(status.NOT_FOUND, "User not found");
  if (
    userDoc.passwordChangedAt &&
    Math.floor(userDoc.passwordChangedAt.getTime() / 1000) > iat
  ) {
    throw new ApiError(
      status.UNAUTHORIZED,
      "Password was changed after this token was issued"
    );
  }
  const payload = buildJwtPayload(userDoc as any);
  const accessToken = createToken(
    payload,
    config.jwt.access.secret as string,
    config.jwt.access.expiresIn as string
  );
  const newRefreshToken = createToken(
    payload,
    config.jwt.refresh.secret as string,
    config.jwt.refresh.expiresIn as string
  );
  console.log("🔄 Generated new tokens during refresh");
  return { accessToken, refreshToken: newRefreshToken };
};

export const AuthService = {
  getMe,
  loginUser,
  verifyEmail,
  refreshToken,
  googleLogin,
  resetPassword,
  changePassword,
  forgotPassword,
  verifyResetPassLink,
  resendResetPassLink,
  resendVerificationLink,
  logoutUser
};
