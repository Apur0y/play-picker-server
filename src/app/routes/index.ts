import { Router } from "express";
import { paymentRoutes } from "../modules/payment/payment.routes";
import { userRoutes } from "../modules/user/user.routes";
import { sportsRoutes } from "../modules/sports/sports.routes";
import { packageRoute } from "../modules/packages/package.routes";


export const router = Router();

router.use("/users",userRoutes)
router.use("/sports",sportsRoutes)
router.use("/payment", paymentRoutes);
router.use("/packages", packageRoute);


