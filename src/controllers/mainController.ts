import { Request, Response } from 'express';

const landing = function (req: Request, res: Response) {
  res.send('SYRF - Puppeteer Service');
};

const healthCheck = function (req: Request, res: Response) {
  res.send({
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
  });
};

export default { landing, healthCheck };
