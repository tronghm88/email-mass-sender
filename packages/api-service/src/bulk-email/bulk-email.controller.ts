import {
  Controller,
  Post,
  Body,
  Req,
  BadRequestException,
  Get,
  Query,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BulkEmailDto } from './bulk-email.dto';
import { BulkEmailBatchService } from './bulk-email-batch.service';
import { Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { EmailLog } from './email-log.entity';
import { BulkEmailBatch } from './bulk-email-batch.entity';

@Controller('bulk-email')
export class BulkEmailController {
  constructor(
    @InjectQueue('bulkEmail') private readonly bulkEmailQueue: Queue,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly bulkEmailBatchService: BulkEmailBatchService,
    @InjectRepository(EmailLog)
    private readonly emailLogRepo: Repository<EmailLog>,
    @InjectRepository(BulkEmailBatch)
    private readonly batchRepo: Repository<BulkEmailBatch>,
  ) {}

  @Post('send')
  // @UseGuards(JwtAuthGuard)
  async sendBulkEmail(@Body() dto: BulkEmailDto, @Req() req) {
    const { sender, subject, body, recipients } = dto;
    const userId = req.user?.id;
    const batchSize = 125;

    const totalBatches = Math.ceil(recipients.length / batchSize);
    const baseTime = new Date();

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * batchSize;
      const batchRecipients = recipients.slice(start, start + batchSize);

      // Calculate delay
      // Each pair of batches is sent per day: first batch (no delay), second batch (+15m)
      // 0: +0d, 1: +0d+15m, 2: +1d, 3: +1d+15m, 4: +2d, 5: +2d+15m, ...
      const dayOffset = Math.floor(batchIndex / 2);
      const isSecondBatchOfDay = batchIndex % 2 === 1;

      let delayMs = dayOffset * 24 * 60 * 60 * 1000; // days in ms
      if (isSecondBatchOfDay) {
        delayMs += 15 * 60 * 1000; // add 15 minutes in ms
      }

      const jobData = {
        sender,
        subject,
        body,
        recipients: batchRecipients,
        userId,
        batchIndex,
        totalBatches,
        totalRecipients: recipients.length,
      };

      // Tính thời điểm chạy job (datetime)
      const runAt = new Date(baseTime.getTime() + delayMs);

      // Lưu thông tin batch vào database
      await this.bulkEmailBatchService.createBatch({
        sender_email: sender,
        count: batchRecipients.length,
        batchIndex,
        datetime: runAt,
      });

      await this.bulkEmailQueue.add('send-bulk', jobData, {
        removeOnComplete: true,
        removeOnFail: false, // giữ lại job fail để debug
        delay: delayMs, // delay in ms from now
      });
    }

    return {
      success: true,
      message: `Đã tạo job gửi email.`,
    };
  }

  @Get('progress')
  async getMailProgress() {
    // Lấy mốc 00:00 hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Lấy các batch từ hôm nay trở đi
    const batches = await this.batchRepo.find({
      where: { datetime: MoreThanOrEqual(today) },
      order: { datetime: 'ASC' },
    });
    const totalJobs = batches.reduce((sum, b) => sum + b.count, 0);

    // Lấy các email log từ hôm nay trở đi
    const [sentJobs, successJobs, failJobs] = await Promise.all([
      this.emailLogRepo.count({ where: { timestamp: MoreThanOrEqual(today) } }),
      this.emailLogRepo.count({
        where: { timestamp: MoreThanOrEqual(today), status: 'success' },
      }),
      this.emailLogRepo.count({
        where: { timestamp: MoreThanOrEqual(today), status: 'fail' },
      }),
    ]);

    return {
      totalJobs,
      sentJobs,
      successJobs,
      failJobs,
      batches,
    };
  }

  @Get('logs')
  async getJobLogs(@Query('date') date: string, @Query('page') page = 1) {
    // date: 'yyyy-mm-dd', page: number (default 1)
    page = Number(page) || 1;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException(
        'Invalid or missing date (format: yyyy-mm-dd)',
      );
    }
    const pageSize = 100;
    const start = (page - 1) * pageSize;
    // So sánh chính xác ngày (timestamp = date)
    // Sử dụng truy vấn cho Postgres: DATE(timestamp) = :date
    // QueryBuilder để filter theo ngày và phân trang, sort DESC
    const qb = this.emailLogRepo
      .createQueryBuilder('log')
      .where('DATE(log.timestamp) = :date', { date })
      .orderBy('log.timestamp', 'DESC');
    const [logs, total] = await qb.skip(start).take(pageSize).getManyAndCount();
    return {
      total,
      page,
      pageSize,
      logs,
    };
  }
}
