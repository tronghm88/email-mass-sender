// Example NestJS Controller
import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GoogleService } from './google.service';
import { SenderEmailService } from './sender-email.service';

@Controller('sender-email')
export class SenderEmailController {
  constructor(
    private readonly googleService: GoogleService,
    private readonly senderEmailService: SenderEmailService,
  ) {}

  @Post('verify')
  async verifyEmail(@Body('token') token: string) {
    // Exchange code for tokens
    const { tokens, email } = await this.googleService.verifyGoogleToken(token);
    console.log(tokens);
    // Save to database
    await this.senderEmailService.create({
      email,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(tokens.expiry_date),
    });

    return {
      email,
    };
  }

  // @UseGuards(JwtAuthGuard)`
  @Get()
  async getAllEmails() {
    const emails = await this.senderEmailService.findAllEmails();
    return emails;
  }

  // @UseGuards(JwtAuthGuard)
  @Delete(':email')
  async deleteEmail(@Param('email') email: string) {
    await this.senderEmailService.deleteByEmail(email);
    return { message: 'Deleted' };
  }
}
