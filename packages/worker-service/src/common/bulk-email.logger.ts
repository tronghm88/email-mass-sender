import * as winston from 'winston';
import * as path from 'path';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export class BulkEmailLogger {
  private logger: winston.Logger;

  constructor() {
    const logDir = path.join(__dirname, '../../logs');

    const transport = new DailyRotateFile({
      dirname: logDir,
      filename: '%DATE%-bulk-email.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
    });

    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [transport],
    });
  }

  logSuccess({ sender, recipient, batchIndex, jobId, refreshed = false }) {
    this.logger.info({
      type: 'success',
      sender,
      recipient,
      batchIndex,
      jobId,
      refreshed,
    });
  }

  logFail({ sender, recipient, batchIndex, jobId, error }) {
    this.logger.error({
      type: 'fail',
      sender,
      recipient,
      batchIndex,
      jobId,
      error: error?.message || error,
    });
  }
}
