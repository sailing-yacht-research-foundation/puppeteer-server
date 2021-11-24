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

  const base64Credentials = req.headers.authorization.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString(
    'ascii',
  );
  const [username, password] = credentials.split(':');
  // Note: Hardcoded. Do we need to have DB tables for this, it's only for inter-service communication.
  const validList = [{ username: 'LDS', password: 'LDSnotTheChurch' }];
  if (
    !validList.find((row) => {
      return row.username === username && row.password === password;
    })
  ) {
    return res
      .status(401)
      .json({ message: 'Invalid Authentication Credentials' });
  }

  next();
}
