import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from './common/logger.module';
import { bullmqConfig } from './config/bullmq.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { BulkEmailModule } from './jobs/bulk-email.module';
import googleConfig from './config/google.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [googleConfig],
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    BullModule.forRoot(bullmqConfig),
    LoggerModule,
    BulkEmailModule,
    // Các module khác
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
