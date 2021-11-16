import Redis from 'ioredis';

let bullClient: Redis.Redis | null = null;
let bullSubscriber: Redis.Redis | null = null;

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
      console.log(
        'redis create connection is taking too long, skip waiting for redis connection',
      );
      resolve();
    }, 5000);

    bullClient.ping((err) => {
      if (err) {
        console.log('redis connection failed', err);
        reject(err);
      }

      console.log(
        'redis connection created to ',
        process.env.REDIS_HOST,
        opt.port,
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
