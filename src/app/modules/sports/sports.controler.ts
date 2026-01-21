import { Request, Response } from "express";
import * as SportsService from "../sports/sports.service";

export const createSports = async (req: Request, res: Response) => {
  try {
    const result = await SportsService.createSports(req.body);
    res.status(201).json({
      success: true,
      message: "Sports created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create sports",
      error,
    });
  }
};

export const getAllSports = async (_req: Request, res: Response) => {
  try {
    const result = await SportsService.getAllSports();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch sports",
      error,
    });
  }
};

export const getSingleSports = async (req: Request, res: Response) => {
  try {
    const result = await SportsService.getSingleSports(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Sports not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch sports",
      error,
    });
  }
};

export const updateSports = async (req: Request, res: Response) => {
  try {
    const result = await SportsService.updateSports(
      req.params.id,
      req.body
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Sports not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Sports updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update sports",
      error,
    });
  }
};

export const deleteSports = async (req: Request, res: Response) => {
  try {
    const result = await SportsService.deleteSports(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Sports not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Sports deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete sports",
      error,
    });
  }
};


export const reorderSports = async (req: Request, res: Response) => {
  try {
    await SportsService.reorderSports(req.body);

    res.status(200).json({
      success: true,
      message: "Sports reordered successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reorder sports",
      error,
    });
  }
};

