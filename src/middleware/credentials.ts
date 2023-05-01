import { Request, Response, NextFunction } from "express";
import { allowedOrigins } from "../config/allowed_origins";

export const credentials = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origins as string

  if(allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origins', origin)
  }

  next()
}