import { Request, Response, NextFunction } from 'express';
import { generateDateAuthFormat, generateSecret } from '../utils/authUtils';
import { AuthInvalidError, BadRequestError } from './errorHandler';

export default function basicAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.headers['authorization'] && !req.headers['Authorization']) {
    throw new BadRequestError('No Authorization Header');
  }
  let secretCheck = generateSecret(generateDateAuthFormat());
  if (secretCheck !== req.headers.authorization) {
    throw new AuthInvalidError('No Match');
  }
  next();
}
