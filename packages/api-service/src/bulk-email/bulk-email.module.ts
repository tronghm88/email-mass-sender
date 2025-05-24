import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { BulkEmailController } from './bulk-email.controller';

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
})
export class BulkEmailModule {}
