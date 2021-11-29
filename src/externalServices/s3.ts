import AWS from 'aws-sdk';
import logger from '../logger';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
});

export const uploadMapScreenshot = async (
  imageBuffer: Buffer,
  fileName: string,
): Promise<AWS.S3.ManagedUpload.SendData | null> => {
  const ogBucket = process.env.OPEN_GRAPH_BUCKET_NAME;
  if (ogBucket === undefined) {
    logger.error('Open Graph Bucket is not Set');
    return null;
  }
  const response = await s3
    .upload({
      ACL: 'public-read',
      Bucket: ogBucket,
      Key: `public/${fileName}`,
      Body: imageBuffer,
      ContentEncoding: 'base64',
      ContentType: 'image/png',
    })
    .promise();
  return response;
};
