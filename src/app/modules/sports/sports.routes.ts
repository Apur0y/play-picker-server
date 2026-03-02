import { Router } from "express";
import { createSports, deleteSports, getAllSports, getSingleSports, reorderSports, updateSports } from "./sports.controler";

const router =Router();

router
.route("/")
.post(createSports)
.get(getAllSports);

router
.route("/:id")
.get(getSingleSports)
.put(updateSports)
.delete(deleteSports);

router.patch("/sports/reorder", reorderSports);

export const sportsRoutes=router;