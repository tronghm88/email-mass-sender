import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

export interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  googleId: string;
  role: string;
}

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    console.log(this.configService.get<string>('google.callbackURL'));
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('google.clientId'),
      this.configService.get<string>('google.clientSecret'),
      this.configService.get<string>('google.callbackURL'),
    );
  }

  validateOAuthLogin(profile: any): any {
    // Ở đây bạn có thể lưu user vào DB nếu muốn
    // hoặc chỉ return user info cho JWT
    return profile;
  }

  async verifyGoogleToken(token: string): Promise<UserData> {
    try {
      console.log(token);
      console.log(this.configService.get<string>('google.clientId'));
      // Xác thực token với Google
      const { tokens } = (await this.googleClient.getToken(token)) as any;
      console.log(tokens);
      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: this.configService.get<string>('google.clientId'),
      });

      const payload = ticket.getPayload();
      console.log(payload);
      if (!payload) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Kiểm tra user trong bảng users
      const existedUser = await this.userRepo.findOne({
        where: { email: payload.email },
      });
      if (!existedUser) {
        // Không catch UnauthorizedException này, để controller trả về đúng message
        throw new UnauthorizedException('Email chưa được đăng ký');
      }

      // Tạo thông tin user từ payload
      const userData: UserData = {
        email: payload.email || '',
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        picture: payload.picture || '',
        googleId: payload.sub || '',
        role: existedUser.role,
      };
      console.log(userData);

      return userData;
    } catch (error) {
      // Nếu là UnauthorizedException (ví dụ: email chưa đăng ký), ném lại để controller xử lý đúng message
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Token verification failed:', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  createToken(userData: UserData): string {
    // Tạo JWT token
    return this.jwtService.sign(
      { sub: userData.googleId, email: userData.email },
      {
        secret:
          this.configService.get<string>('jwt.secret') || 'default_secret',
        expiresIn: '7d',
      },
    );
  }
}
