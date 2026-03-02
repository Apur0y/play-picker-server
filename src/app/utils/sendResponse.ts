import { Response } from "express";

interface ResponseData {
  statusCode: number;
  message: string;
  data?: any;
}

const sendResponse = (res: Response, data: ResponseData) => {
  res.status(data.statusCode).json({
    success: data.statusCode < 400,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data || null,
  });
};

export default sendResponse;
