import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Global()
@Module({
  providers: [
    {
      provide: LoggerService,
      useFactory: () => {
        return new LoggerService('WorkerService');
      },
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {}
