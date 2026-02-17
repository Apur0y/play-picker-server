import { Router } from "express";
import { createUserController, deleteUser, getUsers, updateInfo, upload, uploadPicture } from "../modules/user/user.controler";
import {
	createPackage,
	getPackages,
	getPackage,
	updatePackageController,
	deletePackageController,
} from "../modules/packages/package.controler";
import * as SportsController from "../modules/sports/sports.controler";
import { paymentRouter } from "../modules/payment/payment.routes";


export const router = Router();

// User routes
router.post("/create-user", createUserController);
router.get("/get-users", getUsers);
router.put("/update-users/:id", updateInfo);
router.put("/delete-user/:id", deleteUser);
// router.put("/get-user/:id", deleteUser);
router.post("/upload-picture", upload.single("picture"), uploadPicture);

// Package routes
router.post("/packages", createPackage);
router.get("/packages", getPackages);
router.get("/packages/:id", getPackage);
router.put("/packages/:id", updatePackageController);
router.delete("/packages/:id", deletePackageController);

//Sports routed
router.post("/sports", SportsController.createSports);
router.get("/sports", SportsController.getAllSports);
router.get("/sports/:id", SportsController.getSingleSports);
router.put("/sports/:id", SportsController.updateSports);
router.delete("/sports/:id", SportsController.deleteSports);
router.patch("/sports/reorder", SportsController.reorderSports);
// Payment routes (SSLCommerz)
router.use("/payment", paymentRouter);