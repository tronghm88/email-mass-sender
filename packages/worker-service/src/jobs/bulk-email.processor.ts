import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { BulkEmailService } from './bulk-email.service';
import { SenderService } from './sender.service';
import { BulkEmailLogger } from '../common/bulk-email.logger';

@Processor('bulkEmail')
export class BulkEmailProcessor extends WorkerHost {
  constructor(
    private readonly bulkEmailService: BulkEmailService,
    private readonly senderService: SenderService,
    private readonly logger: BulkEmailLogger,
    @InjectQueue('bulkEmail') private readonly bulkEmailQueue: Queue,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case 'send-bulk':
        return this.sendBulkEmail(job);
        break;
      default:
        break;
    }
  }

  async sendBulkEmail(job: Job): Promise<any> {
    const {
      sender,
      subject,
      body,
      recipients,
      userId,
      batchIndex,
      retryCount = 0,
    } = job.data;
    console.log(job.data);
    const failedRecipients: string[] = [];
    const maxRetry = 3;

    // Lấy token và refresh_token của sender từ database
    const senderAuth = await this.senderService.getSenderAuth(sender);
    const accessToken = senderAuth.accessToken;
    const refreshToken = senderAuth.refreshToken;

    // Save job done log to Redis (TypeScript logic, no Lua)
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const bangkok = new Date(utc + 7 * 60 * 60 * 1000);
    const dateStr = `${bangkok.getFullYear()}${String(bangkok.getMonth() + 1).padStart(2, '0')}${String(bangkok.getDate()).padStart(2, '0')}`;
    const jobDoneKey = `job_done:${dateStr}`;

    for (const email of recipients) {
      try {
        await this.bulkEmailService.sendMailViaGmailAPI({
          refreshToken,
          accessToken,
          sender,
          recipient: email,
          subject,
          body,
        });
        this.logger.logSuccess({
          sender,
          recipient: email,
          batchIndex,
          jobId: job.id,
        });

        const logData = JSON.stringify({
          sender,
          recipient: email,
          timestamp: now.toISOString(),
          error: '',
        });
        await this.redis.lpush(jobDoneKey, logData);
        const ttl = await this.redis.ttl(jobDoneKey);
        if (ttl < 0) {
          await this.redis.expire(jobDoneKey, 864000); // 10 days
        }
      } catch (err) {
        console.log(err);
        if (this.bulkEmailService.isTokenExpiredError(err)) {
          try {
            const newToken =
              await this.bulkEmailService.refreshAccessToken(refreshToken);
            await this.senderService.updateSenderAccessToken(sender, newToken);
            await this.bulkEmailService.sendMailViaGmailAPI({
              refreshToken,
              accessToken: newToken,
              sender,
              recipient: email,
              subject,
              body,
            });
            console.log('success');
            this.logger.logSuccess({
              sender,
              recipient: email,
              batchIndex,
              jobId: job.id,
              refreshed: true,
            });
            continue;
          } catch (refreshErr) {
            console.log(refreshErr);
            console.log('fail');
            this.logger.logFail({
              sender,
              recipient: email,
              batchIndex,
              jobId: job.id,
              error: refreshErr,
            });
            failedRecipients.push(email);
          }
        } else {
          this.logger.logFail({
            sender,
            recipient: email,
            batchIndex,
            jobId: job.id,
            error: err,
          });
          failedRecipients.push(email);
        }
      }
    }

    if (failedRecipients.length > 0 && retryCount < maxRetry) {
      await this.bulkEmailQueue.add(
        'send-bulk',
        {
          sender,
          subject,
          body,
          recipients: failedRecipients,
          userId,
          batchIndex,
          retryCount: retryCount + 1,
        },
        {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 1,
        },
      );
    } else if (failedRecipients.length > 0 && retryCount >= maxRetry) {
      for (const email of failedRecipients) {
        const logData = JSON.stringify({
          sender,
          recipient: email,
          timestamp: now.toISOString(),
          error: `Exceeded max retry (${maxRetry})`,
        });
        await this.redis.lpush(jobDoneKey, logData);
      }
      // Optional: vẫn logFail tổng hợp cho debug
      this.logger.logFail({
        sender,
        recipient: failedRecipients.join(','),
        batchIndex,
        jobId: job.id,
        error: `Exceeded max retry (${maxRetry})`,
      });
    }
  }
}
