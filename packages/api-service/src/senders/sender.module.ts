import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SenderEmail } from './sender-email.entity';
import { SenderEmailService } from './sender-email.service';
import { SenderEmailController } from './sender-email.controller';
import { GoogleService } from './google.service';
import { ConfigModule } from '@nestjs/config';
import { SendTestMailService } from './send-test-mail.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([SenderEmail])],
  controllers: [SenderEmailController],
  providers: [SenderEmailService, GoogleService, SendTestMailService],
  exports: [SenderEmailService],
})
export class SenderModule {}
