import { Types } from "mongoose";
import { Order } from "./order.model";
import { IOrder } from "./order.inteface";


const createOrder = async (payload: IOrder) => {
  const result = await Order.create(payload);
  return result;
};

const getAllOrders = async () => {
  return await Order.find()
    .populate("buyerId", "name email")
    .sort({ createdAt: -1 });
};

const getSingleOrder = async (id: string) => {
  const result = await Order.findById(id).populate(
    "buyerId",
    "name email"
  );

  if (!result) {
    throw new Error("Order not found");
  }

  return result;
};

const getOrdersByBuyer = async (buyerId: string) => {
  return await Order.find({ buyerId: new Types.ObjectId(buyerId) })
    .sort({ createdAt: -1 });
};

const updateOrderStatus = async (
  id: string,
  status: "pending" | "in_progress" | "completed" | "cancelled"
) => {
  const result = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!result) {
    throw new Error("Order not found");
  }

  return result;
};

const deleteOrder = async (id: string) => {
  const result = await Order.findByIdAndDelete(id);

  if (!result) {
    throw new Error("Order not found");
  }

  return result;
};

export const OrderService = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  getOrdersByBuyer,
  updateOrderStatus,
  deleteOrder,
};