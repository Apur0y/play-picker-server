import { Types } from "mongoose";

export enum Role{
    SUPER_ADMIN="SUPER_ADMIN",
    ADMIN="ADMIN",
    USER="USER"
}

export enum IsActive{
    ACTIVE="ACTIVE",
    INACTIVE="INACTIVE",
    BLOCKED="BLOCKED"
}

export interface IAuthProvider {
        provider:string;
        providerId:string;
}

export interface IUser{
      name: string;
      email: string;
      password?: string;
      phone?: string;
      picture?: string;
      address?: string;
      isDeleted?: boolean;
      isActive?: IsActive;
      isVerified?: boolean;
      role: Role;
      auths: IAuthProvider[];

      // fields used by auth service
      isResetPassword?: boolean;
      canResetPassword?: boolean;
      passwordChangedAt?: Date;
      roleChangedAt?: Date;

      booking?: Types.ObjectId[];
      guides?: Types.ObjectId[];
}
