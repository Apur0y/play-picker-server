import { Router } from "express";
import * as paymentController from "./payment.controler";

export const paymentRouter = Router();

// Payment initiation
paymentRouter.post("/initiate", paymentController.initiatePayment);

// Payment validation and callback
paymentRouter.post("/validate", paymentController.validatePayment);
paymentRouter.post("/ipn", paymentController.handleIPN);

// Payment details and history
paymentRouter.get("/details/:transactionId", paymentController.getPaymentDetails);
paymentRouter.get("/user/:userId", paymentController.getUserPayments);

// Payment status management
paymentRouter.put("/:transactionId/status", paymentController.updatePaymentStatus);

// Payment statistics (Admin)
paymentRouter.get("/stats/overview", paymentController.getPaymentStats);

// Callback redirect endpoints (SSLCommerz supports both GET and POST)
paymentRouter.get("/success", paymentController.paymentSuccess);
paymentRouter.post("/success", paymentController.paymentSuccess);
paymentRouter.get("/fail", paymentController.paymentFail);
paymentRouter.post("/fail", paymentController.paymentFail);
paymentRouter.get("/cancel", paymentController.paymentCancel);
paymentRouter.post("/cancel", paymentController.paymentCancel);

export const paymentRoutes = paymentRouter;

