import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bull';
import { BulkEmailDto } from './bulk-email.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('bulk-email')
export class BulkEmailController {
  constructor(
    @InjectQueue('bulkEmail') private readonly bulkEmailQueue: Queue,
  ) {}

  @Post('send')
  @UseGuards(JwtAuthGuard)
  async sendBulkEmail(@Body() dto: BulkEmailDto, @Req() req) {
    const { sender, subject, body, recipients } = dto;
    const userId = req.user?.id;
    const batchSize = 100;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batchRecipients = recipients.slice(i, i + batchSize);
      const jobData = {
        sender,
        subject,
        body,
        recipients: batchRecipients,
        userId,
        batchIndex: Math.floor(i / batchSize),
        totalBatches: Math.ceil(recipients.length / batchSize),
        totalRecipients: recipients.length,
      };

      await this.bulkEmailQueue.add('send-bulk', jobData, {
        removeOnComplete: true,
        removeOnFail: false, // giữ lại job fail để debug
      });
    }

    return {
      success: true,
      message: `Đã tạo job gửi email.`,
    };
  }
}
