import { Types } from "mongoose";

export interface IOrder {
  title: string;
  instructions: string;
  footageUrls: string[];
  deliveryTimeInDays: number;
  revisionCount: number;
  effects: string;
  additionalFeatures: string[];
  totalPrice: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "refunded";
  buyerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}