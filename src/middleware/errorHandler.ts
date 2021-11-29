import { NextFunction, Request, Response } from 'express';

export default function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let { message } = error;
  if (error instanceof BadRequestError) {
    return res.status(400).json({ message });
  } else if (error instanceof AuthInvalidError) {
    return res.status(403).json({ message: 'Forbidden Access' });
  } else {
    return res.status(500).json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : '-',
    });
  }
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthInvalidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
