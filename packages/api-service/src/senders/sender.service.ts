import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { SenderEntity } from './sender.entity';

@Injectable()
export class SenderService {
  // constructor(@InjectRepository(SenderEntity) private repo: Repository<SenderEntity>) {}

  async getSenderAuth(senderEmail: string) {
    // TODO: Lấy access_token, refresh_token, client_id, client_secret từ DB
    // return { accessToken, refreshToken, clientId, clientSecret }
    // Ví dụ giả lập:
    return {
      accessToken: 'your-access-token',
      refreshToken: 'your-refresh-token',
      clientId: 'your-google-client-id',
      clientSecret: 'your-google-client-secret',
    };
  }

  async updateSenderAccessToken(senderEmail: string, newAccessToken: string) {
    // TODO: Update access_token mới vào DB cho senderEmail
  }
}
