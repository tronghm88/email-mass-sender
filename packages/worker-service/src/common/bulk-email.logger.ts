import * as winston from 'winston';
import * as path from 'path';

export class BulkEmailLogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      transports: [
        new winston.transports.File({
          filename: path.join(__dirname, '../../logs', `${this.getDateString()}-bulk-email.log`),
          level: 'info',
        }),
      ],
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    });
  }

  private getDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }

  logSuccess({ sender, recipient, batchIndex, jobId, refreshed = false }) {
    this.logger.info({
      type: 'success',
      sender,
      recipient,
      batchIndex,
      jobId,
      refreshed,
      timestamp: new Date().toISOString(),
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
      timestamp: new Date().toISOString(),
    });
  }
}
