import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Res,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';

interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

interface VerifyTokenDto {
  token: string;
}

@Controller('auth')
export class AuthController {
  private googleClient: OAuth2Client;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Google OAuth redirect - handled by Passport
    // This route will redirect to Google login page
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: { user: GoogleUser },
    @Res() res: Response,
  ) {
    // Lấy thông tin user từ Google OAuth
    const user = req.user;

    // URL frontend để redirect về
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:4200';

    // Encode user info để truyền qua URL
    const userParam = encodeURIComponent(JSON.stringify(user));

    // Redirect về frontend với user info
    return res.redirect(`${frontendUrl}/login?user=${userParam}`);
  }

  @Post('verify-google-token')
  async verifyGoogleToken(@Body() body: VerifyTokenDto) {
    try {
      // Xác thực token với Google
      const userData = await this.authService.verifyGoogleToken(body.token);
      const token = this.authService.createToken(userData);

      // Trả về thông tin user, token và role
      return { user: userData, token };
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new UnauthorizedException(error.message);
    }
  }
}
