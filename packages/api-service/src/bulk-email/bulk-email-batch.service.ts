import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BulkEmailBatch } from './bulk-email-batch.entity';

@Injectable()
export class BulkEmailBatchService {
  constructor(
    @InjectRepository(BulkEmailBatch)
    private readonly batchRepo: Repository<BulkEmailBatch>,
  ) {}

  async createBatch({ sender_email, count, batchIndex, datetime }: {
    sender_email: string;
    count: number;
    batchIndex: number;
    datetime: Date;
  }) {
    return this.batchRepo.save({ sender_email, count, batchIndex, datetime });
  }
}
