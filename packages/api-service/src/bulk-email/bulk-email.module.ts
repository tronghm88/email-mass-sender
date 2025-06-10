import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { BulkEmailController } from './bulk-email.controller';
import { RedisProvider } from '../redis.provider';
import { BulkEmailBatchService } from './bulk-email-batch.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BulkEmailBatch } from './bulk-email-batch.entity';

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
    TypeOrmModule.forFeature([BulkEmailBatch]),
  ],
  controllers: [BulkEmailController],
  providers: [RedisProvider, BulkEmailBatchService],
  exports: [RedisProvider],
})
export class BulkEmailModule {}
