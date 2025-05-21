import { BullRootModuleOptions } from '@nestjs/bullmq';

export const bullmqConfig: BullRootModuleOptions = {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  // Add additional BullMQ options here if needed
};
