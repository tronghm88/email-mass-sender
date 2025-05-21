import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from './common/logger.module';
import { bullmqConfig } from './config/bullmq.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot(bullmqConfig),
    LoggerModule,
    // Các module khác
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
