import express from "express";
import { OrderController } from "./order.controler";

const router = express.Router();

router.post("/", OrderController.createOrder);
router.get("/", OrderController.getAllOrders);
router.get("/:id", OrderController.getSingleOrder);
router.get("/buyer/:buyerId", OrderController.getOrdersByBuyer);
router.patch("/:id/status", OrderController.updateOrderStatus);
router.delete("/:id", OrderController.deleteOrder);

export const OrderRoutes = router;