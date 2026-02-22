import { Role } from "../user/user.interface";
import jwt, { JwtPayload } from "jsonwebtoken";

export type IJwtPayload = {
  id?: string;
  name: string;
  email: string;
  picture?: string | null;
  role: Role;
  isVerified: boolean;
};

export const createToken = (
  jwtPayload: IJwtPayload,
  secret: string,
  expiresIn: string
) => {
  return jwt.sign(
    jwtPayload,
    secret as jwt.Secret,
    {
      expiresIn: expiresIn as string,
    } as jwt.SignOptions
  );
};

export const verifyToken = (token: string, secret: string): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};
