import { Request, Response, NextFunction } from 'express';

export default async function basicAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (
    !req.headers.authorization ||
    req.headers.authorization.indexOf('Basic ') === -1
  ) {
    return res.status(401).json({ message: 'Missing Authorization Header' });
  }
  // Skip validation

  next();
}
