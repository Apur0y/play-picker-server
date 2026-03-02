import { Router } from "express";
import { createPackage, deletePackageController, getPackage, getPackages, updatePackageController } from "./package.controler";

const router =Router();

router
.route("/")
.post(createPackage)
.get( getPackages);

router
.route("/:id")
.get(getPackage)
.put(updatePackageController)
.delete(deletePackageController);

export const packageRoute=router;
