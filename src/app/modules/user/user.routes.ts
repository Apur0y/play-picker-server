import { Router } from "express";
import {
  createUserController,
  deleteUser,
  getUsers,
  updateInfo,
  upload,
  uploadPicture,
} from "./user.controler";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema } from "./user.validation";

const router = Router();

router
  .route("/")
  .post(validateRequest(createUserZodSchema), createUserController)
  .get(getUsers);

router
  .route("/:id")
  .patch(updateInfo)
  .delete(deleteUser);

router.post("/:id/avatar", upload.single("picture"), uploadPicture);

export const userRoutes = router;
