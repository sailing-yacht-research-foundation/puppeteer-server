import { NextFunction, Request, Response } from 'express';

export default function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  return res.status(500).json({
    message: 'Internal Server Error',
    error: error instanceof Error ? error.message : '-',
  });
}
