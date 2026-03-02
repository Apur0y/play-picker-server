import { z } from "zod";
import { Role, IsActive } from "./user.interface";

export const createUserZodSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
    picture: z.string().url().optional(),
    address: z.string().optional(),

    role: z.nativeEnum(Role).optional(),
    isActive: z.nativeEnum(IsActive).optional(),
    isVerified: z.boolean().optional(),

    auths: z
      .array(
        z.object({
          provider: z.string(),
          providerId: z.string(),
        })
      )
      .optional(),
  }),
});
