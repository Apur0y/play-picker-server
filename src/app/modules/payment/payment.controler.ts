import { Request, Response, NextFunction } from "express";
import * as paymentService from "./payment.service";
import AppError from "../../errorHelpers/AppError";
import { envVars } from "../../config/env";

/**
 * Initiate payment endpoint
 * POST /api/payment/initiate
 */
export const initiatePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, packageId, amount, customerName, customerEmail, customerPhone } =
      req.body;

    if (
      !userId ||
      !packageId ||
      !amount ||
      !customerName ||
      !customerEmail ||
      !customerPhone
    ) {
      throw new AppError(
        400,
        "Missing required fields: userId, packageId, amount, customerName, customerEmail, customerPhone"
      );
    }

    const paymentUrl = await paymentService.initiatePaymentService(
      userId,
      packageId,
      amount,
      customerName,
      customerEmail,
      customerPhone
    );

    res.status(200).json({
      success: true,
      message: "Payment session initiated successfully",
      data: paymentUrl,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Validate payment endpoint (Called by SSLCommerz IPN)
 * POST /api/payment/validate
 */
export const validatePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tran_id, total_amount, status } = req.body;

    if (!tran_id || !total_amount) {
      throw new AppError(400, "Missing required fields: tran_id, total_amount");
    }

    // If callback indicates successful payment
    if (status === "VALID" || status === "success") {
      const validationResult = await paymentService.validatePaymentService(
        tran_id
        // total_amount
      );

      const confirmationResult = await paymentService.confirmPaymentService(
        tran_id,
        validationResult
      );

      res.status(200).json({
        success: true,
        message: "Payment validated and confirmed",
        data: confirmationResult,
      });
    } else {
      // Payment failed
      const payment = await paymentService.updatePaymentStatusService(tran_id, "failed");
      res.status(400).json({
        success: false,
        message: "Payment validation failed",
        data: payment,
      });
    }
  } catch (err) {
    next(err);
  }
};



/**
 * IPN Endpoint (Instant Payment Notification)
 * POST /api/payment/ipn
 */
export const handleIPN = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tran_id, total_amount, status, val_id } = req.body;

    if (!tran_id || !total_amount) {
      throw new AppError(400, "Missing required fields in IPN");
    }

    // Validate payment with SSLCommerz
    const validationResult = await paymentService.validatePaymentService(
      tran_id
      // total_amount
    );

    if (validationResult.status === "VALID") {
      // Confirm payment
      await paymentService.confirmPaymentService(tran_id, validationResult);
      res.status(200).json({
        success: true,
        message: "IPN processed successfully",
      });
      
    } else {
      // Update payment as failed
      await paymentService.updatePaymentStatusService(tran_id, "failed");
      res.status(400).json({
        success: false,
        message: "Payment validation failed in IPN",
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Get payment details
 * GET /api/payment/:transactionId
 */
export const getPaymentDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { transactionId } = req.params;

    const payment = await paymentService.getPaymentDetailsService(transactionId);

    res.status(200).json({
      success: true,
      message: "Payment details retrieved successfully",
      data: payment,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all payments for a user
 * GET /api/payment/user/:userId
 */
export const getUserPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const payments = await paymentService.getUserPaymentsService(userId);

    res.status(200).json({
      success: true,
      message: "User payments retrieved successfully",
      data: payments,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update payment status (Admin only)
 * PUT /api/payment/:transactionId/status
 */
export const updatePaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new AppError(400, "Status field is required");
    }

    const updatedPayment = await paymentService.updatePaymentStatusService(
      transactionId,
      status
    );

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: updatedPayment,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get payment statistics (Admin only)
 * GET /api/payment/stats/overview
 */
export const getPaymentStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await paymentService.getPaymentStatsService();

    res.status(200).json({
      success: true,
      message: "Payment statistics retrieved successfully",
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Payment success callback (Redirect page)
 * GET /api/v1/payment/success?tran_id=xxx
 */
export const paymentSuccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // SSLCommerz sends data as query parameters
    const { tran_id, amount, val_id, status } = req.body;
    console.log(req.body);
    console.log(req.query);
    console.log(req.method);

    if (!tran_id) {
      return res.redirect(
        `${envVars.FRONTEND_URL}/payment/fail?error=missing_transaction_id`
      );
    }

    // 1️⃣ Validate payment with SSLCommerz
    const validationResponse = await paymentService.validatePaymentService(
  val_id as string
);


    // 2️⃣ Confirm payment in database
    const confirmationResult = await paymentService.confirmPaymentService(
      tran_id as string,
      validationResponse
    );

    // 3️⃣ Redirect to frontend success page
    return res.redirect(
      `${envVars.FRONTEND_URL}/payment/success?tran_id=${tran_id}&val_id=${val_id || ''}`
    );

  } catch (err) {
    console.error("Payment success callback error:", err);
    return res.redirect(
      `${envVars.FRONTEND_URL}/payment/fail?error=validation_failed`
    );
  }
};


/**
 * Payment failure callback (Redirect page)
 * GET /api/v1/payment/fail?tran_id=xxx
 */
export const paymentFail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tran_id } = req.query;

    if (!tran_id) {
      return res.redirect(
        `${envVars.FRONTEND_URL}/payment/fail?error=missing_transaction_id`
      );
    }

    // Update payment status to failed
    const payment = await paymentService.updatePaymentStatusService(
      tran_id as string,
      "failed"
    );

    // Redirect to frontend failure page
    return res.redirect(
      `${envVars.FRONTEND_URL}/payment/fail?tran_id=${tran_id}`
    );
  } catch (err) {
    console.error("Payment fail callback error:", err);
    return res.redirect(
      `${envVars.FRONTEND_URL}/payment/fail?error=internal_error`
    );
  }
};

/**
 * Payment cancel callback (Redirect page)
 * GET /api/v1/payment/cancel?tran_id=xxx
 */
export const paymentCancel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tran_id } = req.query;

    if (!tran_id) {
      return res.redirect(
        `${envVars.FRONTEND_URL}/payment/cancel?error=missing_transaction_id`
      );
    }

    // Update payment status to cancelled
    const payment = await paymentService.updatePaymentStatusService(
      tran_id as string,
      "cancelled"
    );

    // Redirect to frontend cancel page
    return res.redirect(
      `${envVars.FRONTEND_URL}/payment/cancel?tran_id=${tran_id}`
    );
  } catch (err) {
    console.error("Payment cancel callback error:", err);
    return res.redirect(
      `${envVars.FRONTEND_URL}/payment/cancel?error=internal_error`
    );
  }
};
