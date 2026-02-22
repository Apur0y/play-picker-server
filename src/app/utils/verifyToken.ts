import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

export const verifyToken = (token: string, secret?: string): JwtPayload => {
  const secretToUse = secret || (config.jwt.access.secret as string);
  return jwt.verify(token, secretToUse) as JwtPayload;
};
