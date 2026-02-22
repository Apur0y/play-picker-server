import { Role } from "../user/user.interface";

export type RefreshPayload = {
  id: string;
  name: string;
  email: string;
  role: Role;
  iat: number;
  picture?: string;
  exp: number;
  isVerified: boolean;
};
