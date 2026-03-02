import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { verifyToken } from "../utils/verifyToken";
import ApiError from "../errors/ApiError";
import status from "http-status";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const auth = (requiredRoles?: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

      if (!token) {
        throw new ApiError(status.UNAUTHORIZED, "No token provided!");
      }

      const decoded = verifyToken(token, config.jwt.access.secret as string);

      req.user = decoded;

      if (requiredRoles && requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        throw new ApiError(status.FORBIDDEN, "Insufficient permissions!");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
