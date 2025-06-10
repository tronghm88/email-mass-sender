import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailLog } from './email-log.entity';

@Injectable()
export class EmailLogService {
  constructor(
    @InjectRepository(EmailLog)
    private readonly emailLogRepo: Repository<EmailLog>,
  ) {}

  async logSuccess({
    sender,
    recipient,
    subject,
  }): Promise<{ sender: string; recipient: string; subject?: string }> {
    console.log('Logging success');
    try {
      return this.emailLogRepo.save({
        sender,
        recipient,
        subject,
        status: 'success',
        error: '',
      });
    } catch (error) {
      console.error('Failed to log success:', error);
      throw error;
    }
  }

  async logFail({
    sender,
    recipient,
    subject,
    error,
  }: {
    sender: string;
    recipient: string;
    subject: string;
    error: string;
  }) {
    return this.emailLogRepo.save({
      sender,
      recipient,
      subject,
      status: 'fail',
      error,
    });
  }
}
