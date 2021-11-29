import Redis from 'ioredis';

import logger from './logger';

let bullClient: Redis.Redis;
let bullSubscriber: Redis.Redis;

let opt: Redis.RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

export const connect = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    bullClient = new Redis(process.env.REDIS_HOST, opt);
    bullSubscriber = new Redis(process.env.REDIS_HOST, opt);

    const timeout = setTimeout(() => {
      logger.info(
        'Redis connection is taking too long, skip waiting for redis connection',
      );
      resolve();
    }, 5000);

    bullClient.ping((err) => {
      if (err) {
        logger.error('Redis connection failed: ', err);
        reject(err);
      }

      logger.info(
        `Redis connection established: ${process.env.REDIS_HOST}:${opt.port}`,
      );
      clearTimeout(timeout);
      resolve();
    });
  });
};

export const newConnection = (redisOptions: Redis.RedisOptions) => {
  return new Redis(process.env.REDIS_HOST, { ...opt, ...redisOptions });
};
export const getBullClient = () => bullClient;
export const getBullSubscriber = () => bullSubscriber;

export function createClient(
  type: 'client' | 'subscriber' | 'bclient',
  redisOpts: Redis.RedisOptions,
) {
  switch (type) {
    case 'subscriber':
      return getBullSubscriber();
    case 'bclient':
      return newConnection(redisOpts);
    case 'client':
    default:
      return getBullClient();
  }
}
