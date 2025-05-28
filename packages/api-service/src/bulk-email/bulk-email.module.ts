import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { BulkEmailController } from './bulk-email.controller';
import { RedisProvider } from '../redis.provider';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'bulkEmail',
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
  ],
  controllers: [BulkEmailController],
  providers: [RedisProvider],
  exports: [RedisProvider],
})
export class BulkEmailModule {}
