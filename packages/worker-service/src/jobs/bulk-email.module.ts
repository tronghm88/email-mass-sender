import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BulkEmailProcessor } from './bulk-email.processor';
import { BulkEmailService } from '../jobs/bulk-email.service';
import { SenderService } from '../jobs/sender.service';
import { BulkEmailLogger } from '../common/bulk-email.logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SenderEmail } from './sender-email.entity';
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
    TypeOrmModule.forFeature([SenderEmail]),
  ],
  providers: [
    BulkEmailProcessor,
    BulkEmailService,
    SenderService,
    RedisProvider,
    {
      provide: BulkEmailLogger,
      useClass: BulkEmailLogger,
    },
  ],
})
export class BulkEmailModule {}
