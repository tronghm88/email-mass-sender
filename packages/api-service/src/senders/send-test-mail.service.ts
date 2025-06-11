import { Injectable, NotFoundException } from '@nestjs/common';
import { SenderEmailService } from './sender-email.service';
import { SendTestMailDto } from './send-test-mail.dto';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SendTestMailService {
  constructor(
    private readonly senderEmailService: SenderEmailService,
    private readonly configService: ConfigService,
  ) {}

  async sendTestMail(dto: SendTestMailDto) {
    const { sender, recipient } = dto;
    const subject = dto.subject || 'MES test chức năng gửi mail';
    const body = dto.body || 'MES test chức năng gửi mail';

    // Lấy thông tin sender từ DB
    const senderInfo = await this.senderEmailService.findByEmail(sender);
    if (!senderInfo) throw new NotFoundException('Sender not found');

    // Khởi tạo OAuth2 client
    const oAuth2Client = new google.auth.OAuth2(
      this.configService.get<string>('google.clientId'),
      this.configService.get<string>('google.clientSecret'),
      this.configService.get<string>('google.callbackURL'),
    );
    oAuth2Client.setCredentials({
      access_token: senderInfo.accessToken,
      refresh_token: senderInfo.refreshToken,
      expiry_date: senderInfo.expiresAt?.getTime(),
    });

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const messageParts = [
      `From: ${sender}`,
      `To: ${recipient}`,
      `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body,
    ];
    const rawMessage = Buffer.from(messageParts.join('\r\n'))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    try {
      const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: rawMessage },
      });
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message || error };
    }
  }
}
