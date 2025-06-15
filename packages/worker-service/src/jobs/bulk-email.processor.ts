import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { BulkEmailService } from './bulk-email.service';
import { SenderService } from './sender.service';
import { BulkEmailLogger } from '../common/bulk-email.logger';
import { EmailLogService } from './email-log.service';

@Processor('bulkEmail')
export class BulkEmailProcessor extends WorkerHost {
  constructor(
    private readonly bulkEmailService: BulkEmailService,
    private readonly senderService: SenderService,
    private readonly logger: BulkEmailLogger,
    private readonly emailLogService: EmailLogService,
    @InjectQueue('bulkEmail') private readonly bulkEmailQueue: Queue,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    console.log('Processing job:', job.id);
    console.log(job.data);
    switch (job.name) {
      case 'send-bulk':
        return this.sendBulkEmail(job);
        break;
      default:
        break;
    }
  }

  async sendBulkEmail(job: Job): Promise<any> {
    const { sender, subject, body, recipients, userId, batchIndex } = job.data;

    // Lấy token và refresh_token của sender từ database
    const senderAuth = await this.senderService.getSenderAuth(sender);
    const accessToken = senderAuth.accessToken;
    const refreshToken = senderAuth.refreshToken;
    const accessTokenExpiryDate = senderAuth.expiresAt;

    for (const email of recipients) {
      let sent = false;
      try {
        // await this.bulkEmailService.sendMailViaGmailAPI({
        //   refreshToken,
        //   accessToken,
        //   senderEmail: sender,
        //   recipient: email,
        //   subject,
        //   body,
        //   accessTokenExpiryDate,
        // });

        await this.emailLogService.logSuccess({
          sender,
          recipient: email,
          subject,
        });

        this.logger.logSuccess({
          sender,
          recipient: email,
          subject,
          batchIndex,
          jobId: job.id,
        });
        sent = true;
        await this.sleep(1000);
      } catch (err) {
        // Nếu lỗi do token hết hạn, thử refresh 1 lần
        if (!sent && this.bulkEmailService.isTokenExpiredError(err)) {
          try {
            const { newAccessToken, newRefreshToken, newExpiresAt } =
              await this.bulkEmailService.refreshAccessToken(refreshToken);
            await this.senderService.updateSenderAccessToken(
              sender,
              newAccessToken,
              newRefreshToken,
              newExpiresAt,
            );
            await this.bulkEmailService.sendMailViaGmailAPI({
              refreshToken: newRefreshToken,
              accessToken: newAccessToken,
              senderEmail: sender,
              recipient: email,
              subject,
              body,
              accessTokenExpiryDate,
            });
            await this.emailLogService.logSuccess({
              sender,
              recipient: email,
              subject,
            });
            this.logger.logSuccess({
              sender,
              recipient: email,
              subject,
              batchIndex,
              jobId: job.id,
              refreshed: true,
            });
            sent = true;
            await this.sleep(2000);
          } catch (refreshErr) {
            await this.emailLogService.logFail({
              sender,
              recipient: email,
              subject,
              error: refreshErr?.message || String(refreshErr),
            });
            this.logger.logFail({
              sender,
              recipient: email,
              subject,
              batchIndex,
              jobId: job.id,
              error: refreshErr,
            });
          }
        }
        if (!sent) {
          await this.emailLogService.logFail({
            sender,
            recipient: email,
            subject,
            error: err?.message || String(err),
          });
          this.logger.logFail({
            sender,
            recipient: email,
            subject,
            batchIndex,
            jobId: job.id,
            error: err,
          });
        }
      }
    }
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
