import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SenderEmail } from './sender-email.entity';

@Injectable()
export class SenderService {
  constructor(
    @InjectRepository(SenderEmail)
    private readonly senderEmailRepo: Repository<SenderEmail>,
  ) {}

  async getSenderAuth(senderEmail: string) {
    const sender = await this.senderEmailRepo.findOne({
      where: { email: senderEmail },
    });
    if (!sender) {
      throw new NotFoundException('Sender email not found');
    }
    // Nếu cần clientId/clientSecret, lấy từ env hoặc config service
    return {
      accessToken: sender.accessToken,
      refreshToken: sender.refreshToken,
      expiresAt: sender.expiresAt,
    };
  }

  async updateSenderAccessToken(
    senderEmail: string,
    newAccessToken: string,
    newRefreshToken: string,
    newExpiresAt: Date,
  ) {
    await this.senderEmailRepo.update(
      { email: senderEmail },
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt,
      },
    );
  }
}
