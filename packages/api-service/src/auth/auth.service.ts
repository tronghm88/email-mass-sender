import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async validateOAuthLogin(profile: any): Promise<any> {
    // Ở đây bạn có thể lưu user vào DB nếu muốn
    // hoặc chỉ return user info cho JWT
    return profile;
  }
}
