import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SenderEmail } from './sender-email.entity';

@Injectable()
export class SenderEmailService {
  constructor(
    @InjectRepository(SenderEmail)
    private readonly senderEmailRepo: Repository<SenderEmail>,
  ) {}

  async create(senderEmailData: {
    email: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }) {
    // Check if email already exists
    const existed = await this.findByEmail(senderEmailData.email);
    if (existed) {
      throw new ConflictException('Email đã tồn tại');
    }
    const senderEmail = this.senderEmailRepo.create(senderEmailData);
    return this.senderEmailRepo.save(senderEmail);
  }

  async findByEmail(email: string) {
    return this.senderEmailRepo.findOne({ where: { email } });
  }

  async findAllEmails(): Promise<string[]> {
    const all = await this.senderEmailRepo.find({ select: ['email'] });
    return all.map((item) => item.email);
  }

  async deleteByEmail(email: string): Promise<void> {
    await this.senderEmailRepo.delete({ email });
  }

  async updateTokens(
    email: string,
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresAt: Date;
    },
  ) {
    await this.senderEmailRepo.update({ email }, tokens);
    return this.findByEmail(email);
  }
}
