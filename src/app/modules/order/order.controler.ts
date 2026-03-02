import { Request, Response } from "express";
import httpStatus from "http-status";
import { OrderService } from "./order.service";
import catchAsync from "../../utils/catchAsync";

const createOrder = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrderService.createOrder(req.body);

    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Order created successfully",
      data: result,
    });
  }
);

const getAllOrders = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrderService.getAllOrders();

    res.status(httpStatus.OK).json({
      success: true,
      message: "Orders retrieved successfully",
      data: result,
    });
  }
);

const getSingleOrder = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrderService.getSingleOrder(req.params.id);

    res.status(httpStatus.OK).json({
      success: true,
      message: "Order retrieved successfully",
      data: result,
    });
  }
);

const getOrdersByBuyer = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrderService.getOrdersByBuyer(
      req.params.buyerId
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: "Buyer orders retrieved successfully",
      data: result,
    });
  }
);

const updateOrderStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrderService.updateOrderStatus(
      req.params.id,
      req.body.status
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: "Order status updated successfully",
      data: result,
    });
  }
);

const deleteOrder = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrderService.deleteOrder(req.params.id);

    res.status(httpStatus.OK).json({
      success: true,
      message: "Order deleted successfully",
      data: result,
    });
  }
);

export const OrderController = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  getOrdersByBuyer,
  updateOrderStatus,
  deleteOrder,
};