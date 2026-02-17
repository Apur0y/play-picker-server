import mongoose, { Schema, Document } from "mongoose";
import { IPaymentRequest } from "./payment.interface";

interface IPaymentDocument extends IPaymentRequest, Document {}

const paymentSchema = new Schema<IPaymentDocument>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    packageId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "BDT",
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      default: "SSLCommerz",
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPaymentDocument>("Payment", paymentSchema);
