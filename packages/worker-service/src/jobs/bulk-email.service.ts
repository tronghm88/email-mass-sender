import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class BulkEmailService {
  constructor(private readonly configService: ConfigService) {}

  async sendMailViaGmailAPI({
    sender,
    recipient,
    subject,
    body,
    refreshToken,
    accessToken,
  }) {
    const oAuth2Client = new google.auth.OAuth2(
      this.configService.get<string>('google.clientId'),
      this.configService.get<string>('google.clientSecret'),
      this.configService.get<string>('google.callbackURL'),
    );
    oAuth2Client.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const rawMessage = Buffer.from(
      [
        `To: ${recipient}`,
        `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
        'Content-Type: text/html; charset=utf-8',
        '',
        `${body}`,
      ].join('\n'),
    )
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, ''); // Gmail API yêu cầu base64url không có padding

    const result = await gmail.users.messages.send({
      userId: sender,
      requestBody: {
        raw: rawMessage,
      },
    });

    return result;
  }

  isTokenExpiredError(err: any): boolean {
    return (
      err?.response?.status === 401 ||
      err?.response?.data?.error === 'invalid_grant'
    );
  }

  async refreshAccessToken(
    refreshToken: string,
    senderAuth: any,
  ): Promise<string> {
    const url = 'https://oauth2.googleapis.com/token';
    const params = {
      client_id: senderAuth.clientId,
      client_secret: senderAuth.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };
    const res = await axios.post(url, null, { params });
    return res.data.access_token;
  }
}
