import axios from "axios";
import { Payment } from "./payment.model";
import AppError from "../../errorHelpers/AppError";
import { envVars } from "../../config/env";
import {
  IPaymentRequest,
  ISSLCommerceInitiation,
  ISSLCommerceValidation,
  ISSLCommerceResponse,
  IValidationResponse,
} from "./payment.interface";

/**
 * Generate unique transaction ID
 */
const generateTransactionId = (): string => {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

/**
 * Initiate payment session with SSLCommerz
 */
export const initiatePaymentService = async (
  userId: string,
  packageId: string,
  amount: number,
  customerName: string,
  customerEmail: string,
  customerPhone: string
): Promise<{
  url: string;
  transactionId: string;
  sessionKey?: string;
}> => {
  try {
    if (!userId || !packageId || !amount || amount <= 0) {
      throw new AppError(400, "Invalid payment data: missing or invalid fields");
    }

    // Generate transaction ID
    const transactionId = generateTransactionId();

    // Create payment record in database
    const paymentData: Partial<IPaymentRequest> = {
      transactionId,
      userId,
      packageId,
      amount,
      currency: "USD",
      customerName,
      customerEmail,
      customerPhone,
      status: "pending",
      paymentMethod: "SSLCommerz",
    };

    const payment = await Payment.create(paymentData);

    // Prepare SSLCommerz initiation payload
    const initiationPayload: ISSLCommerceInitiation = {
      store_id: envVars.SSL_STORE_ID,
      store_passwd: envVars.SSL_STORE_PASSWORD,
      total_amount: amount,
      currency: "USD",
      tran_id: transactionId,
      success_url: `${envVars.SERVER_URL}/api/v1/payment/success`,
      fail_url: `${envVars.SERVER_URL}/api/v1/payment/fail`,
      cancel_url: `${envVars.SERVER_URL}/api/v1/payment/cancel`,
      ipn_url: `${envVars.SERVER_URL}/api/v1/payment/ipn`,
      cus_name: customerName,
      cus_email: customerEmail,
      cus_phone: customerPhone,
      shipping_method: "NO",
      product_name: "PlayPicker Package",
      product_category: "subscription",
      product_profile: "general",
    };

    // Call SSLCommerz API to generate session
    const response = await axios.post<ISSLCommerceResponse>(
      envVars.SSL_SESSION_API,
      initiationPayload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (
      response.data.status === "FAILED" ||
      !response.data.sessionkey ||
      !response.data.GatewayPageURL
    ) {
      throw new AppError(
        400,
        response.data.status_message || "Failed to initiate payment session"
      );
    }

    // Return payment URL and transaction ID
    return {
      url: response.data.GatewayPageURL,
      transactionId,
      sessionKey: response.data.sessionkey,
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      500,
      error.message || "Failed to initiate payment with SSLCommerz"
    );
  }
};

/**
 * Validate payment from SSLCommerz IPN
 */
export const validatePaymentService = async (
  val_id: string
): Promise<IValidationResponse> => {
  try {
    if (!val_id) {
      throw new AppError(400, "Missing val_id");
    }

    const response = await axios.get<IValidationResponse>(
      envVars.SSL_VALIDATION_API,
      {
        params: {
          val_id,
          store_id: envVars.SSL_STORE_ID,
          store_passwd: envVars.SSL_STORE_PASSWORD,
          format: "json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new AppError(
      500,
      error.response?.data?.error || error.message || "Validation failed"
    );
  }
};


/**
 * Handle payment confirmation (Called from IPN or callback)
 */
export const confirmPaymentService = async (
  transactionId: string,
  validationResponse: any
): Promise<any> => {
  try {
    const payment = await Payment.findOne({ transactionId });

    if (!payment) {
      throw new AppError(404, "Payment record not found");
    }

    // Check if validation is successful
    if (validationResponse.status === "VALID") {
      // Update payment status to completed
      payment.status = "completed";
      await payment.save();

      return {
        success: true,
        transactionId,
        status: "completed",
        message: "Payment confirmed successfully",
      };
    } else {
      // Mark payment as failed
      payment.status = "failed";
      await payment.save();

      throw new AppError(400, `Payment validation failed: ${validationResponse.status}`);
    }
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, error.message || "Failed to confirm payment");
  }
};

/**
 * Get payment details by transaction ID
 */
export const getPaymentDetailsService = async (transactionId: string): Promise<any> => {
  try {
    if (!transactionId) {
      throw new AppError(400, "Transaction ID is required");
    }

    const payment = await Payment.findOne({ transactionId });

    if (!payment) {
      throw new AppError(404, "Payment not found");
    }

    return payment;
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, error.message || "Failed to retrieve payment details");
  }
};

/**
 * Get all payments for a user
 */
export const getUserPaymentsService = async (userId: string): Promise<any[]> => {
  try {
    if (!userId) {
      throw new AppError(400, "User ID is required");
    }

    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    return payments;
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, error.message || "Failed to retrieve user payments");
  }
};

/**
 * Update payment status manually (for admin purposes)
 */
export const updatePaymentStatusService = async (
  transactionId: string,
  status: "pending" | "completed" | "failed" | "cancelled"
): Promise<any> => {
  try {
    if (!transactionId || !status) {
      throw new AppError(400, "Transaction ID and status are required");
    }

    const validStatuses = ["pending", "completed", "failed", "cancelled"];
    if (!validStatuses.includes(status)) {
      throw new AppError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    const payment = await Payment.findOneAndUpdate(
      { transactionId },
      { status },
      { new: true }
    );

    if (!payment) {
      throw new AppError(404, "Payment not found");
    }

    return payment;
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, error.message || "Failed to update payment status");
  }
};

/**
 * Get payment statistics
 */
export const getPaymentStatsService = async (): Promise<any> => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalPayments = await Payment.countDocuments();
    const totalRevenue = await Payment.aggregate([
      {
        $match: { status: "completed" },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    return {
      totalPayments,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      breakdown: stats,
    };
  } catch (error: any) {
    throw new AppError(500, error.message || "Failed to retrieve payment statistics");
  }
};
