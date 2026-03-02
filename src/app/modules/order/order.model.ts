import { Schema, model, Types } from "mongoose";
import { IOrder } from "./order.inteface";



const orderSchema = new Schema<IOrder>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    instructions: {
      type: String,
      required: true,
    },

    footageUrls: [
      {
        type: String,
        required: true,
      },
    ],

    deliveryTimeInDays: {
      type: Number,
      required: true,
      min: 1,
    },

    revisionCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    effects: {
      type: String,
      required: true,
    },

    additionalFeatures: [
      {
        type: String,
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },

    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // automatically handles createdAt & updatedAt
  }
);

export const Order = model<IOrder>("Order", orderSchema);