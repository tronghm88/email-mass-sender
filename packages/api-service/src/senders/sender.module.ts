import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SenderEmail } from './sender-email.entity';
import { SenderEmailService } from './sender-email.service';
import { SenderEmailController } from './sender-email.controller';
import { GoogleService } from './google.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([SenderEmail])],
  controllers: [SenderEmailController],
  providers: [SenderEmailService, GoogleService],
  exports: [SenderEmailService],
})
export class SenderModule {}
