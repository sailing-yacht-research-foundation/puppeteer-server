import { Request, Response } from 'express';
import { uploadMapScreenshot } from '../externalServices/s3';

import { createMapScreenshot } from '../utils/createMapScreenshot';

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

const testing = async function (req: Request, res: Response) {
  const centerPosition: [number, number] = [108.6328125, -5.615985819155327];
  const imageBuffer = await createMapScreenshot(centerPosition);
  const awsResponse = await uploadMapScreenshot(imageBuffer, 'testing.jpg');
  //   res.contentType('image/jpeg');
  res.send(awsResponse);
};

export default { landing, healthCheck, testing };
