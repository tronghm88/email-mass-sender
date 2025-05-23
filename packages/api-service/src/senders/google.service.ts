import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleToken {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  id_token: string;
  expiry_date: number;
}

@Injectable()
export class GoogleService {
  private googleClient: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    console.log(this.configService.get<string>('google.clientId'));
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('google.clientId'),
      this.configService.get<string>('google.clientSecret'),
      this.configService.get<string>('google.callbackURL'),
    );
  }

  async verifyGoogleToken(
    token: string,
  ): Promise<{ tokens: GoogleToken; email: string }> {
    try {
      // Xác thực token với Google
      console.log(this.googleClient);
      const { tokens } = (await this.googleClient.getToken(token)) as any;
      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: this.configService.get<string>('google.clientId'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const email = payload.email as string;
      console.log({ tokens, email });
      return { tokens, email };
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}
