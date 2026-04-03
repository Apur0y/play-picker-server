import { Request, Response } from "express";
import * as SportsService from "../sports/sports.service";
import fetch from "node-fetch";

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

export const getYouTubeVideos = async (req: Request, res: Response) => {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID; 

    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10`;

    const response = await fetch(url);
    const data: any = await response.json();

    const videos = data.items
      .filter((item: any) => item.id.kind === "youtube#video")
      .map((item: any) => {
        const title = item.snippet.title;
        const firstWord = title.split(" ")[0]; // take the first word

        return {
          id: item.id.videoId,
          title: title,
          type: firstWord,                   // <-- new field
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high.url,
          publishedAt: item.snippet.publishedAt,
          videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          src: `https://www.youtube.com/embed/${item.id.videoId}`,
        };
      });

    res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch YouTube videos",
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

