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

import { Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Controller('bulk-email')
export class BulkEmailController {
  constructor(
    @InjectQueue('bulkEmail') private readonly bulkEmailQueue: Queue,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  @Post('send')
  // @UseGuards(JwtAuthGuard)
  async sendBulkEmail(@Body() dto: BulkEmailDto, @Req() req) {
    const { sender, subject, body, recipients } = dto;
    const userId = req.user?.id;
    const batchSize = 125;

    // Get today's date string in yyyymmdd format
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const bangkok = new Date(utc + 7 * 60 * 60 * 1000);
    const todayString = `${bangkok.getFullYear()}${String(bangkok.getMonth() + 1).padStart(2, '0')}${String(bangkok.getDate()).padStart(2, '0')}`;
    const jobCountKey = `job_count:${todayString}`;
    // Increment job count by number of recipients and only set expiry if not set
    await this.redis.incrby(jobCountKey, recipients.length);
    const ttl = await this.redis.ttl(jobCountKey);
    if (ttl < 0) {
      await this.redis.expire(jobCountKey, 864000); // 10 days
    }

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

  @Get('logs')
  async getJobLogs(@Query('date') date: string, @Query('page') page = 1) {
    // date: 'yyyymmdd', page: number (default 1)
    page = Number(page) || 1;
    if (!date || !/^\d{8}$/.test(date)) {
      throw new BadRequestException('Invalid or missing date (format: yyyymmdd)');
    }
    const key = `job_done:${date}`;
    const jobCountKey = `job_count:${date}`;
    const pageSize = 100;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    const doneCount = await this.redis.llen(key);
    // Lấy tổng số job đã tạo trong ngày
    const jobCountValue = await this.redis.get(jobCountKey);
    const jobCount = jobCountValue ? Number(jobCountValue) : 0;

    const items = await this.redis.lrange(key, start, end);

    // Parse each item (JSON string)
    const logs = items.map((item: string) => {
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    });
    return {
      doneCount, // số job thành công (done)
      jobCount, // tổng số job tạo trong ngày
      page,
      pageSize,
      logs,
    };
  }
}
