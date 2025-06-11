import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

interface GoogleRefreshResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  refresh_token?: string; // refresh_token là tùy chọn
}

@Injectable()
export class BulkEmailService {
  private oAuthClients: Map<string, OAuth2Client> = new Map(); // Cache oAuth2Client instances by senderId

  constructor(private readonly configService: ConfigService) {}

  getOrCreateOAuth2Client(
    senderEmail: string,
    refreshToken: string,
    accessToken: string,
    accessTokenExpiryDate: number,
  ): OAuth2Client {
    let client = this.oAuthClients.get(senderEmail);

    if (!client) {
      client = new OAuth2Client(
        this.configService.get<string>('google.clientId'),
        this.configService.get<string>('google.clientSecret'),
      );
      this.oAuthClients.set(senderEmail, client);
    }

    // LUÔN LUÔN thiết lập credentials với access_token, refresh_token VÀ expiry_date
    // Thư viện sẽ tự động làm mới access_token nếu nó hết hạn
    client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: accessTokenExpiryDate,
    });

    return client;
  }

  // getOrCreateOAuth2Client(
  //   senderEmail: string,
  //   refreshToken: string,
  //   accessToken: string,
  //   accessTokenExpiryDate: number,
  // ): OAuth2Client {
  //   const client = new OAuth2Client(
  //     this.configService.get<string>('google.clientId'),
  //     this.configService.get<string>('google.clientSecret'),
  //   );

  //   // LUÔN LUÔN thiết lập credentials với access_token, refresh_token VÀ expiry_date
  //   // Thư viện sẽ tự động làm mới access_token nếu nó hết hạn
  //   client.setCredentials({
  //     refresh_token: refreshToken,
  //   });

  //   return client;
  // }

  async sendMailViaGmailAPI({
    senderEmail,
    recipient,
    subject,
    body,
    refreshToken,
    accessToken,
    accessTokenExpiryDate,
  }) {
    const oAuth2Client = this.getOrCreateOAuth2Client(
      senderEmail,
      refreshToken,
      accessToken,
      accessTokenExpiryDate,
    );

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
      userId: 'me',
      requestBody: {
        raw: rawMessage,
      },
    });

    console.log(result);

    return result;
  }

  isTokenExpiredError(err: any): boolean {
    return (
      err?.response?.status === 401 ||
      err?.response?.data?.error === 'invalid_grant'
    );
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    newAccessToken: string;
    newRefreshToken: string;
    newExpiresAt: Date;
  }> {
    const url = 'https://oauth2.googleapis.com/token';
    const params = {
      client_id: this.configService.get<string>('google.clientId'),
      client_secret: this.configService.get<string>('google.clientSecret'),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };
    try {
      const res = await axios.post<GoogleRefreshResponse>(url, null, {
        params,
      });

      // Trả về cả access_token và refresh_token (nếu có)
      return {
        newAccessToken: res.data.access_token,
        newRefreshToken: res.data.refresh_token || refreshToken, // Google sẽ gửi lại cái mới nếu muốn thay thế cái cũ
        newExpiresAt: new Date(Date.now() + res.data.expires_in * 1000),
      };
    } catch (error) {
      // Xử lý lỗi chi tiết hơn
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error refreshing token:', error.response.data);
        // Kiểm tra lỗi invalid_grant cụ thể
        if (error.response.data.error === 'invalid_grant') {
          // Ném một lỗi cụ thể để logic gọi biết refresh token đã chết
          throw new Error(
            'Refresh token is invalid or expired. User needs to re-authenticate.',
          );
        }
      } else {
        console.error('Unknown error during token refresh:', error);
      }
      throw error; // Ném lại lỗi để hàm gọi biết
    }
  }
}
