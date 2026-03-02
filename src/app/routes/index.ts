import { Router } from "express";
import { paymentRoutes } from "../modules/payment/payment.routes";
import { userRoutes } from "../modules/user/user.routes";
import { sportsRoutes } from "../modules/sports/sports.routes";
import { packageRoute } from "../modules/packages/package.routes";
import { AuthRoutes } from "../modules/auth/auth.route";
import { OrderRoutes } from "../modules/order/order.routes";


export const router = Router();

router.use("/users",userRoutes);
router.use("/sports",sportsRoutes);
router.use("/payment", paymentRoutes);
router.use("/packages", packageRoute);
router.use("/auth",AuthRoutes)
router.use("/orders",OrderRoutes)


